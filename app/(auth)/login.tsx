import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { EMAIL_REGEX } from '@/constants/validation';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { performOAuthSignIn, signInWithEmail } from '@/services/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');
  const errorMutedBg = useThemeColor({}, 'errorMuted');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const anyLoading = isLoading || oauthLoading !== null;

  // Warm up Chrome Custom Tabs on Android for faster OAuth launch
  useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  const handleEmailLogin = useCallback(async () => {
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(Localization.auth.errors.emailRequired);
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError(Localization.auth.errors.invalidEmail);
      return;
    }
    if (!password) {
      setError(Localization.auth.errors.passwordRequired);
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await signInWithEmail(trimmedEmail, password);
      if (authError) {
        console.warn('[auth] Email sign-in error:', authError.message);
        setError(Localization.auth.errors.invalidCredentials);
      } else {
        router.back();
      }
    } catch (err) {
      console.warn('[auth] Email sign-in failed:', err);
      setError(Localization.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const { data, error: authError } = await performOAuthSignIn(provider);
      if (authError) {
        console.warn('[auth] OAuth sign-in error:', authError.message);
        setError(Localization.auth.errors.oauthFailed);
      } else if (data) {
        router.back();
      }
      // data=null + error=null means user cancelled — do nothing
    } catch (err) {
      console.warn('[auth] OAuth sign-in failed:', err);
      setError(Localization.auth.errors.oauthFailed);
    } finally {
      setOauthLoading(null);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Header */}
        <ThemedText type="h1" style={styles.header}>
          {Localization.auth.header}
        </ThemedText>

        {/* OAuth buttons */}
        <View style={styles.oauthSection}>
          <Button
            variant="secondary"
            title={Localization.auth.googleSignIn}
            onPress={() => handleOAuth('google')}
            isLoading={oauthLoading === 'google'}
            disabled={anyLoading}
          />
          {Platform.OS === 'ios' && (
            <Button
              variant="secondary"
              title={Localization.auth.appleSignIn}
              onPress={() => handleOAuth('apple')}
              isLoading={oauthLoading === 'apple'}
              disabled={anyLoading}
            />
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
          <ThemedText type="caption" style={[styles.dividerText, { color: textSecondary }]}>
            {Localization.auth.orDivider}
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
        </View>

        {/* Email / Password form */}
        <View style={styles.form}>
          <TextInput
            label={Localization.auth.emailLabel}
            placeholder={Localization.placeholders.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!anyLoading}
          />
          <TextInput
            label={Localization.auth.passwordLabel}
            placeholder={Localization.placeholders.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleEmailLogin}
            editable={!anyLoading}
          />

          {error && (
            <View
              style={[styles.errorBox, { backgroundColor: errorMutedBg }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <ThemedText type="caption" style={{ color: errorColor }}>
                {error}
              </ThemedText>
            </View>
          )}

          <Button
            variant="primary"
            title={Localization.auth.submitButton}
            onPress={handleEmailLogin}
            isLoading={isLoading}
            disabled={anyLoading}
          />
        </View>

        {/* Links */}
        <Pressable
          onPress={() => router.push('/forgot-password')}
          disabled={anyLoading}
          hitSlop={12}
          accessibilityRole="link"
          accessibilityLabel={Localization.auth.forgotPassword}
        >
          <ThemedText type="link" style={styles.link}>
            {Localization.auth.forgotPassword}
          </ThemedText>
        </Pressable>

        <View style={styles.registerRow}>
          <ThemedText type="body" style={{ color: textSecondary }}>
            {Localization.auth.noAccount}{' '}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/register')}
            disabled={anyLoading}
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel={Localization.auth.register}
          >
            <ThemedText type="link">{Localization.auth.register}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
  },
  header: {
    textAlign: 'center',
  },
  oauthSection: {
    gap: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    textTransform: 'lowercase',
  },
  form: {
    gap: Spacing.lg,
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  link: {
    textAlign: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
