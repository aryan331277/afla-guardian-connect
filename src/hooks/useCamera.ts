import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CameraPhoto {
  webPath?: string;
  format: string;
  saved: boolean;
}

export const useCamera = () => {
  const [photo, setPhoto] = useState<CameraPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async () => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      const imageUrl = image.webPath;
      setPhoto({
        webPath: imageUrl,
        format: image.format,
        saved: false,
      });

      return imageUrl;
    } catch (error) {
      console.error('Error taking photo:', error);
      // Fallback for web
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      const imageUrl = image.webPath;
      setPhoto({
        webPath: imageUrl,
        format: image.format,
        saved: false,
      });

      return imageUrl;
    } catch (error) {
      console.error('Error selecting photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    photo,
    isLoading,
    takePhoto,
    selectFromGallery,
    clearPhoto: () => setPhoto(null),
  };
};