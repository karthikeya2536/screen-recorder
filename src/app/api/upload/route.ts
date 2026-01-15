import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { saveVideoMetadata } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create unique ID
    const id = randomUUID();
    const filename = `${id}.webm`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, { 
        access: 'public',
        addRandomSuffix: false // We use UUID, so collision unlikely
    });

    // Save metadata
    await saveVideoMetadata(id, blob.url);

    return NextResponse.json({ 
        success: true, 
        id, 
        url: `/share/${id}`,
        videoUrl: blob.url // Return direct URL too if client wants it
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
