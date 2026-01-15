import { NextRequest, NextResponse } from 'next/server';
import { incrementCompletion } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        
        await incrementCompletion(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
