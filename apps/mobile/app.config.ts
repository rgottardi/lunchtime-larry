import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lunchtime Larry',
  slug: 'lunchtime-larry',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-project-id'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lunchtimelarry.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Lunchtime Larry needs your location to find restaurants near you.',
      NSLocationAlwaysUsageDescription: 'Lunchtime Larry needs your location to find restaurants near you.',
      UIBackgroundModes: [
        'location',
        'fetch'
      ]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.lunchtimelarry.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION'
    ],
    googleServicesFile: './google-services.json'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-location',
    'expo-notifications',
    [
      'expo-updates',
      {
        username: 'your-username'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  }
});