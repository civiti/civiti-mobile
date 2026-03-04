import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, InteractionManager, Platform } from 'react-native';

import { Localization } from '@/constants/localization';
import { PUSH_PERMISSION_ASKED_KEY } from '@/constants/storage-keys';
import {
  clearStoredPushToken,
  getAndStorePushToken,
  getStoredPushToken,
  registerPushTokenWithBackend,
  requestNotificationPermission,
} from '@/services/notifications';
import { useAuth } from '@/store/auth-context';
import type { NotificationData, NotificationRoute } from '@/types/notifications';

// ── Foreground display config (module-level, runs once) ──
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Runtime validation for external push data ──
function isValidNotificationRoute(data: unknown): data is NotificationRoute {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (d.screen === 'issue' && typeof d.issueId === 'string' && d.issueId.length > 0) return true;
  if (d.screen === 'achievements' || d.screen === 'badges') return true;
  return false;
}

function parseNotificationRoute(content: Notifications.NotificationContent): NotificationRoute | null {
  const data = content.data as NotificationData | undefined;
  if (data?.route && isValidNotificationRoute(data.route)) {
    return data.route;
  }
  return null;
}

// ── Routing ──
function navigateFromNotification(route: NotificationRoute): void {
  try {
    switch (route.screen) {
      case 'issue':
        router.push({ pathname: '/issues/[id]', params: { id: route.issueId } });
        break;
      case 'achievements':
        router.push('/achievements');
        break;
      case 'badges':
        router.push('/badges');
        break;
      default: {
        const _exhaustive: never = route;
        console.warn('[notifications] Unknown route:', _exhaustive);
      }
    }
  } catch (error) {
    console.warn('[notifications] Navigation from notification failed:', error);
    try {
      router.replace('/');
    } catch {
      // Terminal failure — app is in a broken state
    }
  }
}

// ── Badge context ──
type NotificationBadgeValue = {
  badgeCount: number;
  clearBadge: () => void;
};

export const NotificationBadgeContext =
  createContext<NotificationBadgeValue | null>(null);

export function useNotificationBadge(): NotificationBadgeValue {
  const ctx = useContext(NotificationBadgeContext);
  if (!ctx) {
    throw new Error(
      'useNotificationBadge must be used within a NotificationBadgeContext.Provider',
    );
  }
  return ctx;
}

// ── Main hook (called once in root layout) ──
export function useNotifications(): NotificationBadgeValue {
  const { session } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);
  const promptingRef = useRef(false);
  const prevSessionRef = useRef<typeof session | undefined>(undefined);
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const clearBadge = useCallback(() => setBadgeCount(0), []);

  // Sign-in: request permission + register token
  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    const setup = async () => {
      // Skip if we already have a stored token
      const existing = await getStoredPushToken();
      if (existing || cancelled) return;

      // Skip if user already dismissed the prompt
      const asked = await AsyncStorage.getItem(PUSH_PERMISSION_ASKED_KEY).catch(
        (error) => {
          console.warn('[notifications] Failed to read permission-asked flag:', error);
          return null;
        },
      );
      if (asked === 'true' || cancelled) return;

      // Double-tap guard
      if (promptingRef.current) return;
      promptingRef.current = true;

      // Wait for auth modal dismissal animation to settle
      await new Promise<void>((resolve) =>
        InteractionManager.runAfterInteractions(() => resolve()),
      );
      if (cancelled) {
        promptingRef.current = false;
        return;
      }

      // Pre-permission alert
      Alert.alert(
        Localization.notifications.permissionTitle,
        Localization.notifications.permissionMessage,
        [
          {
            text: Localization.notifications.permissionDeny,
            style: 'cancel',
            onPress: () => {
              promptingRef.current = false;
              if (cancelled) return;
              void AsyncStorage.setItem(
                PUSH_PERMISSION_ASKED_KEY,
                'true',
              ).catch((err: unknown) => {
                console.warn('[notifications] Failed to persist permission-asked flag:', err);
              });
            },
          },
          {
            text: Localization.notifications.permissionAllow,
            onPress: async () => {
              if (cancelled) {
                promptingRef.current = false;
                return;
              }
              try {
                const granted = await requestNotificationPermission();
                if (!granted) {
                  Alert.alert(
                    Localization.notifications.permissionDeniedTitle,
                    Localization.notifications.permissionDeniedMessage,
                  );
                  void AsyncStorage.setItem(
                    PUSH_PERMISSION_ASKED_KEY,
                    'true',
                  ).catch((err: unknown) => {
                    console.warn('[notifications] Failed to persist permission-asked flag:', err);
                  });
                  return;
                }
                const token = await getAndStorePushToken();
                if (token) {
                  void registerPushTokenWithBackend(token).catch((err: unknown) => {
                    console.warn('[notifications] Backend registration failed:', err);
                  });
                  // Only mark as asked after token is persisted locally
                  void AsyncStorage.setItem(
                    PUSH_PERMISSION_ASKED_KEY,
                    'true',
                  ).catch((err: unknown) => {
                    console.warn('[notifications] Failed to persist permission-asked flag:', err);
                  });
                }
              } catch (error) {
                console.warn('[notifications] Setup failed:', error);
                Alert.alert(
                  Localization.notifications.permissionDeniedTitle,
                  Localization.notifications.registrationFailed,
                );
                // Do NOT set PUSH_PERMISSION_ASKED_KEY — allow retry on next login
              } finally {
                promptingRef.current = false;
              }
            },
          },
        ],
        { cancelable: false },
      );
    };

    void setup();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Sign-out: clear stored token (only on explicit sign-out, not initial mount)
  useEffect(() => {
    if (prevSessionRef.current && session === null) {
      void clearStoredPushToken();
      void AsyncStorage.removeItem(PUSH_PERMISSION_ASKED_KEY).catch((err: unknown) => {
        console.warn('[notifications] Failed to clear permission-asked flag on sign-out:', err);
      });
      promptingRef.current = false;
      setBadgeCount(0);
    }
    prevSessionRef.current = session;
  }, [session]);

  // Foreground notification listener → increment badge (only when signed in)
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      if (sessionRef.current) {
        setBadgeCount((prev) => prev + 1);
      }
    });
    return () => sub.remove();
  }, []);

  // Tap listener → route to screen
  useEffect(() => {
    let cancelled = false;

    const handledIds = new Set<string>();

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const id = response.notification.request.identifier;
        if (handledIds.has(id)) return;
        handledIds.add(id);
        const route = parseNotificationRoute(
          response.notification.request.content,
        );
        if (route) {
          navigateFromNotification(route);
        }
      },
    );

    // Handle killed-state launch (deferred per S21 pattern)
    let frameId: number | undefined;
    if (Platform.OS !== 'web') {
      frameId = requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          const response = Notifications.getLastNotificationResponse();
          if (response) {
            const id = response.notification.request.identifier;
            if (!handledIds.has(id)) {
              handledIds.add(id);
              const route = parseNotificationRoute(
                response.notification.request.content,
              );
              if (route) {
                navigateFromNotification(route);
              }
            }
          }
        } catch (error) {
          console.warn('[notifications] Failed to handle cold-start notification:', error);
        }
      });
    }

    return () => {
      cancelled = true;
      sub.remove();
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, []);

  return { badgeCount, clearBadge };
}
