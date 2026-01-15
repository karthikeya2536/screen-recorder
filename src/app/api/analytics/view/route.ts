import { NextRequest, NextResponse } from 'next/server';
import { incrementView, getViews } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        
        const views = await incrementView(id);
        return NextResponse.json({ views });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const views = await getViews(id);
    return NextResponse.json({ views });
}
