import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5ab2a121b55f4a53880718f4d092a5d0',
  appName: 'verdan-agricultural-assistant',
  webDir: 'dist',
  server: {
    url: 'https://5ab2a121-b55f-4a53-8807-18f4d092a5d0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'required',
        photos: 'required'
      }
    }
  }
};

export default config;