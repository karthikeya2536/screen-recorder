"use client";

import { useState } from "react";
import { Recorder } from "@/components/recorder";
import { VideoEditor } from "@/components/video-editor";
import { cn } from "@/lib/utils";
import { Upload, Scissors, Share2 } from "lucide-react";

export default function Home() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  };

  const handleReset = () => {
    setRecordedBlob(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setIsEditing(false);
  };

  const handleTrimSave = (trimmedBlob: Blob) => {
    // Replace original blob with trimmed one
    setRecordedBlob(trimmedBlob);
    
    // update URL
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const newUrl = URL.createObjectURL(trimmedBlob);
    setVideoUrl(newUrl);
    
    setIsEditing(false);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    
    try {
        const formData = new FormData();
        formData.append('file', recordedBlob, 'recording.webm');
        
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Upload failed");
        }
    } catch (e) {
        console.error(e);
        alert("Upload error");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Screen Recorder MVP
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
           By Antigravity
          </a>
        </div>
      </div>
      
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        {!recordedBlob ? (
          <div className="w-full flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-center">
              Capture Your Screen
            </h1>
            <p className="text-slate-400 text-center max-w-md">
              Simple, fast, and secure screen recording directly in your browser. No downloads required.
            </p>
            <Recorder onRecordingComplete={handleRecordingComplete} />
          </div>
        ) : isEditing ? (
            <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                <VideoEditor 
                    videoBlob={recordedBlob}
                    onCancel={() => setIsEditing(false)}
                    onSave={handleTrimSave}
                />
            </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold">Preview Recording</h2>
            
            {videoUrl && (
              <video 
                src={videoUrl} 
                controls 
                className="w-full rounded-xl border border-slate-700 shadow-2xl bg-black aspect-video"
              />
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={handleReset}
                className="px-6 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition-colors"
                title="Discard and record again"
              >
                Discard
              </button>
              
              <button 
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                title="Trim video"
                onClick={() => setIsEditing(true)}
              >
                <Scissors className="w-4 h-4" />
                Trim
              </button>

              <button 
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
                title="Upload and share"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                    <>Uploading...</>
                ) : (
                    <>
                    <Upload className="w-4 h-4" />
                    Upload & Share
                    </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
