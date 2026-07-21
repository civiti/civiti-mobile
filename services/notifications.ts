import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  DEVICE_ID_KEY,
  PUSH_TOKEN_KEY,
  PUSH_TOKEN_REGISTERED_KEY,
} from '@/constants/storage-keys';
import { apiClient } from './api-client';

let androidChannelReady = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && !androidChannelReady) {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FCA311',
    });
    androidChannelReady = true;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getAndStorePushToken(): Promise<string | null> {
  // Never mint a push token inside Expo Go. Expo Go delivers pushes through its own host
  // app (they appear under the Expo Go icon), so a token registered from here duplicates
  // every notification alongside the standalone build's token. Remote push is only meant
  // for development/standalone builds — see https://expo.fyi/dev-client.
  if (isRunningInExpoGo()) {
    console.warn('[notifications] Running in Expo Go — skipping push token registration');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  if (!projectId) {
    console.warn('[notifications] No EAS projectId found — cannot get push token');
    return null;
  }

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    token = result.data;
  } catch (error) {
    console.warn('[notifications] getExpoPushTokenAsync failed:', error);
    if (__DEV__) {
      // Expected to fail on simulator / emulator
      return null;
    }
    throw error;
  }

  try {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  } catch (error) {
    console.warn('[notifications] Failed to persist push token:', error);
    return null; // Caller must not set permission-asked flag without a persisted token
  }

  return token;
}

/**
 * Non-cryptographic, stable per-installation identifier. Lets the backend replace this
 * device's previous push token on rotation instead of accumulating orphaned rows. It is
 * never used as a secret, so `Math.random` entropy is sufficient (mirrors the filename id
 * scheme in utils/photo-upload.ts). Generated once, then persisted.
 */
function generateDeviceId(): string {
  const segment = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${segment()}-${segment()}-${segment()}`;
}

// Cache the in-flight resolution so overlapping registrations can't each generate a
// different id for the same installation (which would register one device as two, leaving
// the orphaned token row this id exists to replace).
let deviceIdPromise: Promise<string | null> | null = null;

export function getOrCreateDeviceId(): Promise<string | null> {
  deviceIdPromise ??= (async () => {
    try {
      const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (existing) return existing;
      const id = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      return id;
    } catch (error) {
      console.warn('[notifications] Failed to read/persist device id:', error);
      deviceIdPromise = null; // let a later call retry after a transient failure
      return null;
    }
  })();
  return deviceIdPromise;
}

export async function registerPushTokenWithBackend(token: string): Promise<void> {
  const os = Platform.OS;
  if (os !== 'ios' && os !== 'android') {
    console.warn('[notifications] registerPushTokenWithBackend called on unsupported platform:', os);
    return;
  }
  const deviceId = await getOrCreateDeviceId();
  await apiClient<{ success: boolean }>('/user/push-token', {
    method: 'POST',
    body: deviceId ? { token, platform: os, deviceId } : { token, platform: os },
  });
  await markTokenRegistered();
}

export async function deregisterPushToken(token: string): Promise<void> {
  await apiClient<{ success: boolean }>('/user/push-token/deregister', {
    method: 'POST',
    body: { token },
  });
}

/** Call BEFORE signOut() while the auth token is still valid. */
export async function deregisterAndCleanupPushToken(): Promise<void> {
  const token = await getStoredPushToken();
  if (!token) return;
  let deregisterError: unknown;
  try {
    await deregisterPushToken(token);
  } catch (err) {
    deregisterError = err;
  }
  await clearStoredPushToken();
  if (deregisterError) throw deregisterError;
}

export async function markTokenRegistered(): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, 'true');
  } catch (error) {
    console.warn('[notifications] Failed to persist token-registered flag:', error);
  }
}

export async function isTokenRegistered(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PUSH_TOKEN_REGISTERED_KEY)) === 'true';
  } catch (error) {
    console.warn('[notifications] Failed to read token-registered flag:', error);
    return false;
  }
}

export async function clearStoredPushToken(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([PUSH_TOKEN_KEY, PUSH_TOKEN_REGISTERED_KEY]);
  } catch (error) {
    console.warn('[notifications] Failed to clear push token — stale token may persist:', error);
  }
}

export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch (error) {
    console.warn('[notifications] Failed to read stored push token:', error);
    return null;
  }
}
