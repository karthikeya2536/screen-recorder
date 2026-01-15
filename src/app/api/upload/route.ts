import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique ID
    const id = randomUUID();
    const filename = `${id}.webm`;
    
    // Ensure upload dir exists (in public/uploads relative to CWD)
    // In Vercel usage, this isn't persistent. But for assignment/local demo it works.
    // We'll use process.cwd() / public / uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists (redundant if I made it, but good for safety)
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Also Initialize simple analytics? 
    // We can just rely on file existence for now, or create a json entry.
    // Let's create a metadata file side-by-side or just keeping it simple.

    return NextResponse.json({ 
        success: true, 
        id, 
        url: `/share/${id}`,
        videoUrl: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
