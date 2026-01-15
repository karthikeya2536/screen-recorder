import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useTrimmer() {
  const [loaded, setLoaded] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    // Load ffmpeg.wasm
    // We use a CDN for the core files to avoid complex local setup in Next.js for now.
    // In production, these should be self-hosted.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const trimVideo = async (videoBlob: Blob, startTime: number, endTime: number): Promise<Blob> => {
    setIsTrimming(true);
    const ffmpeg = ffmpegRef.current;
    
    try {
        if (!loaded) await load();

        const inputName = 'input.webm';
        const outputName = 'output.webm';
        
        await ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

        // Listen to progress
        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        const duration = endTime - startTime;
        
        // Command: -ss [start] -i [input] -t [duration] -c copy [output]
        // Using -c copy is fast but inaccurate seeking. For precise cutting, we might need re-encoding.
        // Screen recordings (VP9) are keyframe-dependent. Let's try copy first, if issues, remove -c copy.
        // Re-encoding ensures frame accuracy but is slower.
        // Let's use re-encoding with fast preset for demo reliability.
        await ffmpeg.exec([
            '-ss', startTime.toString(),
            '-i', inputName,
            '-t', duration.toString(),
            '-c', 'copy', // copy is MUCH faster. 
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const trimmedBlob = new Blob([(data as any)], { type: 'video/webm' });
        
        return trimmedBlob;
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        setIsTrimming(false);
        setProgress(0);
        // Cleanup NOT done here to allow re-use? 
        // Or we should delete files.
        try {
           await ffmpeg.deleteFile('input.webm');
           await ffmpeg.deleteFile('output.webm');
        } catch (e) {}
    }
  };

  return {
    loaded,
    isTrimming,
    progress,
    trimVideo
  };
}
