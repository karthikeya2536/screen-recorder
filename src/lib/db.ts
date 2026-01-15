import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface VideoAnalytics {
    id: string;
    views: number;
}

interface DBData {
    videos: Record<string, VideoAnalytics>;
}

const DB_PATH = join(process.cwd(), 'data');
const DB_FILE = join(DB_PATH, 'analytics.json');

async function getDB(): Promise<DBData> {
    try {
        await mkdir(DB_PATH, { recursive: true });
        const data = await readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return { videos: {} };
    }
}

async function saveDB(data: DBData) {
    try {
        await mkdir(DB_PATH, { recursive: true });
        await writeFile(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("DB Save failed", e);
    }
}

export async function incrementView(id: string) {
    const db = await getDB();
    if (!db.videos[id]) {
        db.videos[id] = { id, views: 0 };
    }
    db.videos[id].views += 1;
    await saveDB(db);
    return db.videos[id].views;
}

export async function incrementCompletion(id: string) {
    const db = await getDB();
    if (!db.videos[id]) {
        db.videos[id] = { id, views: 0 };
    }
    // define completions if not exists
    if (!('completions' in db.videos[id])) {
        (db.videos[id] as any).completions = 0;
    }
    (db.videos[id] as any).completions += 1;
    await saveDB(db);
    return (db.videos[id] as any).completions;
}

export async function getViews(id: string) {
    const db = await getDB();
    return db.videos[id]?.views || 0;
}
