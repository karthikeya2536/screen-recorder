import { NextRequest, NextResponse } from 'next/server';
import { getVideoMetadata } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const metadata = await getVideoMetadata(id);
    
    if (!metadata) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(metadata);
}
