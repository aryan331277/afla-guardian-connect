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
      // Check if we're on web or mobile
      const isWeb = !(window as any).Capacitor?.isNativePlatform();
      
      if (isWeb) {
        // Web implementation - open live camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        
        // Create a video element to show live camera
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '400px';
        video.style.objectFit = 'cover';
        
        // Create capture button
        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'Capture Photo';
        captureBtn.style.cssText = `
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin: 10px;
          cursor: pointer;
          font-size: 16px;
        `;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close Camera';
        closeBtn.style.cssText = `
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin: 10px;
          cursor: pointer;
          font-size: 16px;
        `;
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
        `;
        
        container.appendChild(video);
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.appendChild(captureBtn);
        buttonContainer.appendChild(closeBtn);
        container.appendChild(buttonContainer);
        modal.appendChild(container);
        
        document.body.appendChild(modal);
        
        return new Promise((resolve) => {
          captureBtn.onclick = () => {
            // Create canvas to capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            // Convert to blob and create URL
            canvas.toBlob((blob) => {
              if (blob) {
                const imageUrl = URL.createObjectURL(blob);
                setPhoto({
                  webPath: imageUrl,
                  format: 'jpeg',
                  saved: false,
                });
                
                // Cleanup
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(modal);
                resolve(imageUrl);
              }
            }, 'image/jpeg', 0.9);
          };
          
          closeBtn.onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
            resolve(null);
          };
        });
      } else {
        // Mobile implementation using Capacitor
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
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    setIsLoading(true);
    try {
      const isWeb = !(window as any).Capacitor?.isNativePlatform();
      
      if (isWeb) {
        // Web implementation - file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const imageUrl = URL.createObjectURL(file);
              setPhoto({
                webPath: imageUrl,
                format: file.type.split('/')[1] || 'jpeg',
                saved: false,
              });
              resolve(imageUrl);
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      } else {
        // Mobile implementation using Capacitor
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
      }
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