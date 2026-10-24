import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayursutra.app',
  appName: 'AyurSutra',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
