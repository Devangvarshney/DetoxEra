import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayursutra.app',
  appName: 'AyurSutra',
  webDir: 'out',
  server: {
    url: 'http://10.243.0.162:3000',
    cleartext: true
  }
};

export default config;
