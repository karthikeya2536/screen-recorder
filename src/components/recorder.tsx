"use client"

import React, { useEffect, useRef } from 'react';
import { useScreenRecorder } from '@/hooks/use-screen-recorder';
import { Monitor, Square, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function Recorder({ onRecordingComplete }: RecorderProps) {
  const { isRecording, startRecording, stopRecording, stream } = useScreenRecorder({
    onStop: onRecordingComplete
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 shadow-sm w-full max-w-4xl mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center group">
        {!isRecording && !stream && (
            <div className="text-slate-400 flex flex-col items-center gap-2">
                <Monitor className="w-12 h-12" />
                <p>Click Start to Record</p>
            </div>
        )}
        {(stream) && (
             <video
             ref={videoRef}
             autoPlay
             muted
             playsInline
             className="w-full h-full object-cover"
           />
        )}
        {isRecording && (
            <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            </div>
        )}
      </div>
      
      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={() => startRecording()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            <Disc className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <button
             onClick={() => stopRecording()}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition-all shadow-lg hover:shadow-red-500/25 active:scale-95"
          >
            <Square className="w-5 h-5 fill-current" />
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}
