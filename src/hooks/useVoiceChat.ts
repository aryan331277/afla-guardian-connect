import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (language: string = 'en'): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];

            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio, language },
            });

            setIsProcessing(false);

            if (error) {
              console.error('Speech-to-text error:', error);
              toast({
                title: 'Transcription Error',
                description: 'Failed to transcribe audio. Please try again.',
                variant: 'destructive',
              });
              resolve(null);
              return;
            }

            resolve(data.text);
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsProcessing(false);
          resolve(null);
        }

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  const speakText = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice },
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: 'Speech Error',
        description: 'Failed to generate speech. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    speakText,
  };
};
