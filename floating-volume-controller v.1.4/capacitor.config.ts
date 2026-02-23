import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.volumecontrol.app',
  appName: 'Volume Control',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
