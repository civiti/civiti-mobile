import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Civiti',
  slug: 'Civiti-Mobile',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'civitimobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sorvas.civiti',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      // Matches android-icon-background.png. Only shows through where the
      // background image does not, but leaving it the Expo scaffold blue meant
      // a stray pale tint behind a navy brand mark.
      backgroundColor: '#14213D',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.sorvas.civiti',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  web: {
    output: 'static' as const,
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        // Navy in both schemes, because splash-icon.png is the reversed mark:
        // its cone and handle are pure white, so on the previous #ffffff
        // background the splash would have shown two floating orange arcs and
        // nothing else.
        backgroundColor: '#14213D',
        dark: {
          backgroundColor: '#14213D',
        },
      },
    ],
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        cameraPermission:
          'Civiti are nevoie de acces la cameră pentru a fotografia problemele comunitare.',
        photosPermission:
          'Civiti are nevoie de acces la galerie pentru a selecta fotografii.',
        microphonePermission: false,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Civiti are nevoie de acces la locație pentru a afișa harta problemelor comunitare.',
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    ['expo-notifications', { color: '#FCA311', sounds: [] }],
    'react-native-email-link',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'ecac8e78-3fdd-4005-b420-2d2dadb860f4',
    },
  },
  owner: 'sorvas',
});
