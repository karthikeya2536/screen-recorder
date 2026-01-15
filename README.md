# Browser Screen Recorder MVP

A minimal viable product for browser-based screen recording, editing, and sharing. Built with Next.js, TypeScript, Tailwind CSS, and FFmpeg.wasm.

## Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Application**:
    Visit [http://localhost:3000](http://localhost:3000).

## Architecture Decisions

### Client-Side Processing (FFmpeg.wasm)
I chose `ffmpeg.wasm` for video trimming to leverage the client's processing power and reduce backend load. This allows for immediate feedback and potentially offline editing capabilities.
*   **Trade-off**: Requires downloading ~30MB of WASM binaries on first load (cached thereafter) and relies on `SharedArrayBuffer` support (necessitating specific COOP/COEP headers).

### Storage (Local Filesystem)
For this MVP assignment, files are stored locally in `public/uploads`.
*   **Pros**: Zero external dependency, easy to run locally.
*   **Cons**: Ephemeral in serverless environments (like Vercel). Not scalable.

### Analytics (JSON File)
Views and completions are tracked in a simple `data/analytics.json` file.
*   **Pros**: Simple, portable, human-readable.
*   **Cons**: Concurrency issues at scale, not queryable.

## Production Improvements

If taking this to production, I would:

1.  **Storage**: Move to object storage (AWS S3, Cloudflare R2) and use signed URLs for upload/download.
2.  **Database**: Replace JSON file with a proper DB (PostgreSQL/Redis) for analytics and video metadata.
3.  **Video Processing**: Move heavy video processing to a background worker queue (temporal.io or BullMQ) if client-side performance becomes a bottleneck or for format transcoding (e.g., HLS specific streaming).
4.  **Auth**: Implement User Authentication (NextAuth.js).
5.  **CDN**: Serve video content via CDN.
