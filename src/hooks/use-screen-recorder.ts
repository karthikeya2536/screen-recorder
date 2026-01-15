import { useState, useRef, useCallback } from 'react';

export interface UseScreenRecorderOptions {
  onStop?: (blob: Blob) => void;
}

export function useScreenRecorder({ onStop }: UseScreenRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      setStream(mediaStream);

      // Attempt to get microphone
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getAudioTracks().forEach(track => mediaStream.addTrack(track));
      } catch (err) {
        console.warn("Microphone permission denied or not found", err);
      }

      const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (onStop) onStop(blob);
        
        // Stop all tracks to clear "sharing" status
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
        
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorder.start(1000); // Collect 1s chunks
      setIsRecording(true);

    } catch (err) {
      console.error("Error starting recording:", err);
    }
  }, [onStop]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    stream
  };
}
