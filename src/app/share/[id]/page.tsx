"use client";

import { useEffect, useState } from "react";
import { Eye, Download } from "lucide-react";
import { useParams } from "next/navigation";

export default function SharePage() {
    const params = useParams();
    const id = params?.id as string;
    const [views, setViews] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // Get Video URL
        fetch(`/api/video/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.url) setVideoUrl(data.url);
            })
            .catch(console.error);

        // Register view
        fetch('/api/analytics/view', {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.views) setViews(data.views);
        })
        .catch(err => console.error("Failed to track view", err));

    }, [id]);

    if (!id) return <div>Invalid Link</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Shared Recording
                    </h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                        <Eye className="w-4 h-4" />
                        <span>{views} views</span>
                    </div>
                </div>

                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    {videoUrl ? (
                        <video 
                            src={videoUrl} 
                            controls 
                            className="w-full h-full"
                            autoPlay
                            playsInline
                            preload="metadata"
                            onEnded={() => {
                                fetch('/api/analytics/complete', {
                                    method: 'POST',
                                    body: JSON.stringify({ id }),
                                    headers: { 'Content-Type': 'application/json' }
                                }).catch(console.error);
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            Loading video...
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <a 
                        href={videoUrl || '#'} 
                        download={`recording-${id}.webm`}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-200 font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Download Video
                    </a>
                </div>
                
                <div className="text-center pt-8">
                     <p className="text-slate-500 text-sm">Powered by Screen Recorder MVP</p>
                </div>
            </div>
        </div>
    );
}
