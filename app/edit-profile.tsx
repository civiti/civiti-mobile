import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RadioGroup } from '@/components/ui/radio-group';
import { TextInput } from '@/components/ui/text-input';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useProfile } from '@/hooks/use-profile';
import { useThemeColor } from '@/hooks/use-theme-color';
import { updateUserProfile } from '@/services/user';
import { ResidenceType } from '@/types/enums';

const DISTRICT_OPTIONS = Localization.register.districts.map((d) => ({
  value: d,
  label: d,
}));

const RESIDENCE_OPTIONS = [
  { value: ResidenceType.Apartment, label: Localization.register.residenceApartment },
  { value: ResidenceType.House, label: Localization.register.residenceHouse },
  { value: ResidenceType.Business, label: Localization.register.residenceBusiness },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useProfile();

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const errorMutedBg = useThemeColor({}, 'errorMuted');

  const [displayName, setDisplayName] = useState('');
  const [district, setDistrict] = useState<string | null>(null);
  const [residenceType, setResidenceType] = useState<ResidenceType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize from profile data
  useEffect(() => {
    if (data) {
      setDisplayName(data.displayName ?? '');
      setDistrict(data.district ?? null);
      const rt = data.residenceType;
      if (rt && Object.values(ResidenceType).includes(rt as ResidenceType)) {
        setResidenceType(rt as ResidenceType);
      }
    }
  }, [data]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      Alert.alert(Localization.editProfile.saveSuccess);
      router.back();
    },
    onError: (err) => {
      console.warn('[edit-profile] Save failed:', err);
      setValidationError(Localization.editProfile.saveFailed);
    },
  });

  const handleSave = useCallback(() => {
    if (isPending) return;

    const trimmed = displayName.trim();
    if (!trimmed) {
      setValidationError(Localization.editProfile.displayNameRequired);
      return;
    }

    setValidationError(null);
    save({
      displayName: trimmed,
      county: Localization.register.defaultCounty,
      city: Localization.register.defaultCity,
      district,
      residenceType: residenceType ?? undefined,
    });
  }, [isPending, displayName, district, residenceType, save]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <LoadingSkeleton />
      </ThemedView>
    );
  }

  if (isError || !data) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <ErrorState onRetry={() => { void refetch(); }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Display name */}
          <View style={styles.section}>
            <TextInput
              label={Localization.editProfile.displayNameLabel}
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          {/* Location (read-only county/city) */}
          <View style={styles.section}>
            <TextInput
              label={Localization.editProfile.countyLabel}
              value={Localization.register.defaultCounty}
              editable={false}
            />
            <TextInput
              label={Localization.editProfile.cityLabel}
              value={Localization.register.defaultCity}
              editable={false}
            />
            <Dropdown
              label={Localization.editProfile.districtLabel}
              placeholder={Localization.editProfile.districtPlaceholder}
              options={DISTRICT_OPTIONS}
              selectedValue={district}
              onValueChange={setDistrict}
            />
          </View>

          {/* Residence type */}
          <View style={styles.section}>
            <ThemedText type="label">{Localization.editProfile.residenceLabel}</ThemedText>
            <RadioGroup
              options={RESIDENCE_OPTIONS}
              selectedValue={residenceType}
              onValueChange={(v) => setResidenceType(v as ResidenceType)}
            />
          </View>

          {/* Error */}
          {validationError && (
            <View
              style={[styles.errorBox, { backgroundColor: errorMutedBg }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <ThemedText type="caption" style={{ color: errorColor }}>
                {validationError}
              </ThemedText>
            </View>
          )}

          {/* Save button */}
          <Button
            variant="primary"
            title={isPending ? Localization.editProfile.saving : Localization.editProfile.saveButton}
            onPress={handleSave}
            isLoading={isPending}
            disabled={isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ─── Screen Header ─────────────────────────────────────────────

function ScreenHeader({
  onBack,
  textColor,
  topInset,
}: {
  onBack: () => void;
  textColor: string;
  topInset: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + Spacing.sm }]}>
      <Pressable
        onPress={onBack}
        style={styles.headerButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={Localization.actions.back}
      >
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </Pressable>
      <ThemedText type="h2" accessibilityRole="header">
        {Localization.editProfile.title}
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
  },
  section: {
    gap: Spacing.md,
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
});
