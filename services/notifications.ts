import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { PUSH_TOKEN_KEY, PUSH_TOKEN_REGISTERED_KEY } from '@/constants/storage-keys';
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

export async function registerPushTokenWithBackend(token: string): Promise<void> {
  const os = Platform.OS;
  if (os !== 'ios' && os !== 'android') {
    console.warn('[notifications] registerPushTokenWithBackend called on unsupported platform:', os);
    return;
  }
  await apiClient<{ success: boolean }>('/user/push-token', {
    method: 'POST',
    body: { token, platform: os },
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
  if (token) {
    try {
      await deregisterPushToken(token);
    } catch (err) {
      console.warn('[notifications] Pre-signout deregistration failed:', err);
    }
  }
  await clearTokenRegisteredFlag();
  await clearStoredPushToken();
}

export async function clearTokenRegisteredFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY);
  } catch (error) {
    console.warn('[notifications] Failed to clear token-registered flag:', error);
  }
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
