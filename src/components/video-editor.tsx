"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTrimmer } from '@/hooks/use-trimmer';
import { Scissors, Download, RefreshCw, Upload } from 'lucide-react';

interface VideoEditorProps {
    videoBlob: Blob;
    onCancel: () => void;
    onSave: (blob: Blob) => void; 
    onUpload?: (blob: Blob) => void;
}

export function VideoEditor({ videoBlob, onCancel, onSave, onUpload }: VideoEditorProps) {
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const { loaded, isTrimming, progress, trimVideo } = useTrimmer();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoBlob]);

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const vid = e.currentTarget;
        setDuration(vid.duration);
        setEndTime(vid.duration);
    };

    const handleTrim = async () => {
        // Enforce valid range
        if (startTime < 0 || endTime > duration || startTime >= endTime) {
            alert("Invalid time range");
            return;
        }
        
        try {
            const trimmed = await trimVideo(videoBlob, startTime, endTime);
            onSave(trimmed);
        } catch (error) {
            console.error(error);
            alert("Failed to trim video");
        }
    };

    return (
        <div className="w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="relative aspect-video bg-black">
                {videoUrl && (
                    <video 
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                )}
                
                {/* Overlay Loader */}
                {!loaded && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white backdrop-blur-sm z-10">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading FFmpeg...
                    </div>
                )}
                 {isTrimming && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white z-20 flex-col gap-4">
                        <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                        <div className="text-xl font-bold">Processing... {progress}%</div>
                        <p className="text-sm text-slate-400">Please wait while we trim your video</p>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Edit Video</h3>
                    <div className="text-sm text-slate-400 font-mono">
                        Duration: {duration.toFixed(1)}s
                    </div>
                </div>

                {/* Trimming Controls */}
                <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-4">
                    <label className="text-sm font-medium text-slate-300">Trim Range (seconds)</label>
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-xs text-slate-500">Start</span>
                            <input 
                                type="number" 
                                min={0} 
                                max={duration} 
                                step={0.1}
                                value={startTime} 
                                onChange={(e) => setStartTime(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded p-2 text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-xs text-slate-500">End</span>
                            <input 
                                type="number" 
                                min={0} 
                                max={duration} 
                                step={0.1}
                                value={endTime} 
                                onChange={(e) => setEndTime(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded p-2 text-white w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    {/* Visual slider placeholder - native range inputs are tricky for dual thumb */}
                    <div className="relative w-full h-2 bg-slate-700 rounded-full mt-2">
                        <div 
                            className="absolute top-0 bottom-0 bg-indigo-500 opacity-50"
                            style={{ 
                                left: `${(startTime / duration) * 100}%`, 
                                right: `${100 - (endTime / duration) * 100}%` 
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                         onClick={handleTrim}
                         disabled={!loaded || isTrimming}
                         className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
                    >
                        <Scissors className="w-4 h-4" />
                        Trim & Save
                    </button>
                    {onUpload && (
                         <button 
                         onClick={() => onUpload(videoBlob)} // Upload original? Or trimmed? Usually user trims then upload. But if they don't trim, they can upload original.
                         className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
