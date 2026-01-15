import { kv } from '@vercel/kv';

export interface VideoMetadata {
    id: string;
    url: string;
    createdAt: number;
}

export async function saveVideoMetadata(id: string, url: string) {
    const data: VideoMetadata = {
        id,
        url,
        createdAt: Date.now()
    };
    await kv.set(`video:${id}`, data);
    return data;
}

export async function getVideoMetadata(id: string): Promise<VideoMetadata | null> {
    return await kv.get(`video:${id}`);
}

export async function incrementView(id: string) {
    // Determine key for views, e.g. "video:ID:views"
    // Using a separate key for counter is usage efficient in Redis
    const views = await kv.incr(`video:${id}:views`);
    return views;
}

export async function getViews(id: string) {
    const views = await kv.get<number>(`video:${id}:views`);
    return views || 0;
}

export async function incrementCompletion(id: string) {
    const completions = await kv.incr(`video:${id}:completions`);
    return completions;
}

