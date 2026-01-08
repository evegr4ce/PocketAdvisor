This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Seeding Firestore (Mock Data)

Seed files live in [seed](seed). Use the local seeder to load them into Firestore, or the Cloud Function to reset data.

### Local Seeder

1. Install admin SDK:

```bash
npm install --save firebase-admin
```

2. Dry run (no writes):

```bash
npm run seed:firestore -- --dry-run
```

3. Write to Firestore (requires credentials):

```bash
export FIREBASE_PROJECT_ID=your-project-id
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
npm run seed:firestore
```

Add `--purge` to clear existing docs before seeding.

### Cloud Functions (Reset Seed Data)

Functions are in [functions](functions). Deploy with Firebase CLI and call the `resetSeedData` callable (admin/demo claim required):

```bash
firebase deploy --only functions
```

Client example:

```ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const fn = httpsCallable(getFunctions(), 'resetSeedData');
await fn({ collections: ['users','accounts','budgets','goals','subscriptions','transactions'] });
```

## How to run the Chatbot
For a free and functional AI conversational tool, you will need to install and have a running model here is the set up

### One time Installation
Download ollama from [this site](https://ollama.com/)

### Every time you want to use the chatbot
run this code and leave it running in the terminal

```ts
ollama pull llama3.1:8b
ollama run llama3.1:8b
```