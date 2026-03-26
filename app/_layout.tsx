import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import {
  FiraSans_400Regular,
  FiraSans_600SemiBold,
  FiraSans_700Bold,
  FiraSans_800ExtraBold,
} from '@expo-google-fonts/fira-sans';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  NotificationBadgeContext,
  useNotifications,
} from '@/hooks/use-notifications';
import { AuthProvider } from '@/store/auth-context';
import { QueryProvider } from '@/store/query-client';
import { ONBOARDING_KEY } from '@/constants/storage-keys';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    FiraSans_400Regular,
    FiraSans_600SemiBold,
    FiraSans_700Bold,
    FiraSans_800ExtraBold,
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // Check onboarding flag on mount
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => setShowOnboarding(value !== 'true'))
      .catch((err) => {
        console.warn('[layout] Failed to read onboarding flag:', err);
        // Default to showing onboarding — re-showing is better than
        // permanently skipping it for a first-time user.
        setShowOnboarding(true);
      });
  }, []);

  // Wait for both fonts and onboarding check, then navigate + hide splash
  useEffect(() => {
    if (fontError) {
      console.warn('[layout] Font loading failed:', fontError);
    }
    if ((!fontsLoaded && !fontError) || showOnboarding === null) return;

    if (showOnboarding) {
      // Defer to next frame so the Stack tree is committed
      const id = requestAnimationFrame(() => router.replace('/onboarding'));
      void SplashScreen.hideAsync();
      return () => cancelAnimationFrame(id);
    }
    void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, showOnboarding]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (showOnboarding === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryProvider>
        <AuthProvider>
          <AppShell>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="issues/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="activity" options={{ headerShown: false }} />
                <Stack.Screen name="badges" options={{ headerShown: false }} />
                <Stack.Screen name="achievements" options={{ headerShown: false }} />
                <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="blocked-users" options={{ headerShown: false }} />
                <Stack.Screen name="community-guidelines" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'none' }} />
                <Stack.Screen name="(auth)" options={{ presentation: 'modal', headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AppShell>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const notificationBadge = useNotifications();

  return (
    <NotificationBadgeContext.Provider value={notificationBadge}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
