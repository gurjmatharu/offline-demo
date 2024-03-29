This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

# React App Overview

## API Call Structure

- Random character calls to Star Wars API.
- Queue system for managing calls: offline (queued) and online (processed).
- Status tracking (queued, in progress, completed, failed).

## Token Refresh

- Refresh on switching from offline to online.
- Also triggers on receiving a 401 (Unauthorized) error.

### Local Storage and Firestore Integration

- Utilizes Local Storage to cache API responses and queue status, ensuring data persistence across sessions.
- Integrated Firestore database for cloud syncing of API responses.
- Implements a system to sync local cache with Firestore when transitioning from offline to online, ensuring data consistency.

## Known Bugs and Fixes

- Fixed issues with response data being overwritten.
- Timestamps as unique IDs for API call tracking.
- Token refresh logic optimized to prevent redundancy.

## Conclusion

- Current implementation with Local Storage most likely suits the app's needs.
- If complexity increaes alternative libraries may be needed.
