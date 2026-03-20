import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import {
  ThemedBottomSheet,
  type BottomSheetMethods,
} from '@/components/ui/bottom-sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { TextInput } from '@/components/ui/text-input';
import { TERMS_OF_SERVICE_URL } from '@/constants/api';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '@/constants/validation';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { performOAuthSignIn, signOut, signUp } from '@/services/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const termsSheetRef = useRef<BottomSheetMethods>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const errorColor = useThemeColor({}, 'error');
  const errorMutedBg = useThemeColor({}, 'errorMuted');
  const successColor = useThemeColor({}, 'success');
  const successBg = useThemeColor({}, 'successMuted');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);

  // Holds the displayName to use after OAuth terms acceptance
  const pendingOAuthNameRef = useRef<string>('');

  const anyLoading = isLoading || oauthLoading !== null || termsLoading;

  useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync().catch(() => {});
      return () => {
        void WebBrowser.coolDownAsync().catch(() => {});
      };
    }
  }, []);

  const validate = useCallback((): boolean => {
    if (!displayName.trim()) {
      setError(Localization.register.errors.displayNameRequired);
      return false;
    }
    if (!email.trim()) {
      setError(Localization.auth.errors.emailRequired);
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError(Localization.auth.errors.invalidEmail);
      return false;
    }
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(Localization.register.errors.passwordTooShort);
      return false;
    }
    if (!termsAccepted) {
      setError(Localization.register.errors.termsRequired);
      return false;
    }
    return true;
  }, [displayName, email, password, termsAccepted]);

  const handleRegister = useCallback(async () => {
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data, error: authError } = await signUp(
        email.trim(),
        password.trim(),
        { display_name: displayName.trim() },
      );
      if (authError) {
        console.warn('[auth] Sign-up error:', authError.message);
        const msg = authError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setError(Localization.register.errors.emailAlreadyRegistered);
        } else if (msg.includes('rate limit') || (msg.includes('after') && msg.includes('seconds'))) {
          setError(Localization.errors.tooManyRequests);
        } else {
          setError(Localization.register.errors.signUpFailed);
        }
      } else if (!data.session) {
        // Email confirmation required — don't navigate to profile yet
        setConfirmationSent(true);
      } else {
        router.push({
          pathname: '/register-profile',
          params: { displayName: displayName.trim() },
        });
      }
    } catch (err) {
      console.warn('[auth] Sign-up failed:', err);
      setError(Localization.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }, [displayName, email, password, validate]);

  const handleOAuth = useCallback(
    async (provider: 'google' | 'apple') => {
      setError(null);
      if (!displayName.trim()) {
        setError(Localization.register.errors.displayNameRequired);
        return;
      }
      setOauthLoading(provider);
      try {
        const { data, error: authError } = await performOAuthSignIn(provider);
        if (authError) {
          console.warn('[auth] OAuth sign-up error:', authError.message);
          setError(Localization.auth.errors.oauthFailed);
        } else if (data) {
          // OAuth succeeded — show terms confirmation before proceeding
          pendingOAuthNameRef.current = displayName.trim();
          termsSheetRef.current?.expand();
        }
        // data=null + error=null means user cancelled — do nothing
      } catch (err) {
        console.warn('[auth] OAuth sign-up failed:', err);
        setError(Localization.auth.errors.oauthFailed);
      } finally {
        setOauthLoading(null);
      }
    },
    [displayName],
  );

  const handleTermsAccept = useCallback(() => {
    const name = pendingOAuthNameRef.current;
    if (!name) {
      setError(Localization.register.errors.displayNameRequired);
      termsSheetRef.current?.close();
      return;
    }
    termsSheetRef.current?.close();
    router.push({
      pathname: '/register-profile',
      params: { displayName: name },
    });
  }, []);

  const handleTermsDecline = useCallback(async () => {
    termsSheetRef.current?.close();
    setTermsLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.warn('[auth] Sign-out after terms decline failed:', err);
      setError(Localization.errors.generic);
    } finally {
      setTermsLoading(false);
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
          {Localization.register.header}
        </ThemedText>

        {confirmationSent ? (
          <View
            style={[styles.successBox, { backgroundColor: successBg }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <ThemedText type="body" style={{ color: successColor }}>
              {Localization.register.emailConfirmationSent}
            </ThemedText>
          </View>
        ) : (
          <>
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

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label={Localization.register.displayNameLabel}
                placeholder={Localization.placeholders.name}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                editable={!anyLoading}
              />
              <TextInput
                ref={emailRef}
                label={Localization.auth.emailLabel}
                placeholder={Localization.placeholders.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!anyLoading}
              />
              <TextInput
                ref={passwordRef}
                label={Localization.auth.passwordLabel}
                placeholder={Localization.placeholders.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!anyLoading}
              />

              <View style={styles.termsRow}>
                <Checkbox
                  checked={termsAccepted}
                  onToggle={() => setTermsAccepted((prev) => !prev)}
                  accessibilityLabel={Localization.register.termsCheckboxLabel}
                />
                <Pressable
                  onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL).catch(() => Alert.alert(Localization.errors.generic))}
                  hitSlop={8}
                  accessibilityRole="link"
                >
                  <ThemedText type="link">{Localization.register.termsLabel}</ThemedText>
                </Pressable>
              </View>

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
                title={Localization.register.submitButton}
                onPress={handleRegister}
                isLoading={isLoading}
                disabled={anyLoading}
              />
            </View>

            {/* Link to login */}
            <View style={styles.loginRow}>
              <ThemedText type="body" style={{ color: textSecondary }}>
                {Localization.register.hasAccount}{' '}
              </ThemedText>
              <Pressable
                onPress={() => router.back()}
                disabled={anyLoading}
                hitSlop={12}
                accessibilityRole="link"
                accessibilityLabel={Localization.register.login}
              >
                <ThemedText type="link">{Localization.register.login}</ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Terms confirmation bottom sheet (shown after OAuth success) */}
      <ThemedBottomSheet ref={termsSheetRef} snapPoints={['35%']}>
        <View style={styles.termsSheet}>
          <ThemedText type="h3">{Localization.register.termsPromptTitle}</ThemedText>
          <ThemedText type="body">{Localization.register.termsPromptBody}</ThemedText>
          <View style={styles.termsActions}>
            <Button
              variant="primary"
              title={Localization.register.termsPromptAccept}
              onPress={handleTermsAccept}
              disabled={termsLoading}
            />
            <Button
              variant="ghost"
              title={Localization.register.termsPromptDecline}
              onPress={handleTermsDecline}
              isLoading={termsLoading}
              disabled={termsLoading}
            />
          </View>
        </View>
      </ThemedBottomSheet>
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
  successBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsSheet: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  termsActions: {
    gap: Spacing.md,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
