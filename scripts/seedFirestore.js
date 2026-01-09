#!/usr/bin/env node
/**
 * PocketAdvisor Firestore Seeder
 * Usage:
 *  DRY RUN: node scripts/seedFirestore.js --dry-run
 *  WRITE: FIREBASE_PROJECT_ID=your-project GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json node scripts/seedFirestore.js
 *  PURGE + WRITE: ... node scripts/seedFirestore.js --purge
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === '1';
const purge = args.includes('--purge');
// Resolve seed directory relative to repo root (one level up from scripts)
const seedDir = path.join(__dirname, '..', 'seed');

const serviceAccount = require('../serviceAccountKey.json');

function loadJson(file) {
  const p = path.join(seedDir, file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

async function loadJsonLines(file) {
  const p = path.join(seedDir, file);
  const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });
  const out = [];
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    out.push(JSON.parse(trimmed));
  }
  return out;
}

async function main() {
  console.log(`[Seeder] Starting with dryRun=${dryRun} purge=${purge}`);

  // Load data
  const users = loadJson('users.json');
  const accounts = loadJson('accounts.json');
  const budgets = loadJson('budgets.json');
  const goals = loadJson('goals.json');
  const subscriptions = loadJson('subscriptions.json');
  const transactions = await loadJsonLines('transactions.jsonl');

  console.log(`[Seeder] Loaded: users=${users.length}, accounts=${accounts.length}, budgets=${budgets.length}, goals=${goals.length}, subs=${subscriptions.length}, txns=${transactions.length}`);

  if (dryRun) {
    // Print a small sample and exit
    console.log('[Seeder] DRY RUN: sample user uids:', users.slice(0, 3).map(u => u.uid));
    return;
  }

  // Lazy-load firebase-admin only when writing
  const admin = require('firebase-admin');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error('FIREBASE_PROJECT_ID is required when not in dry-run.');
    process.exit(1);
  }
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId
      });
    } catch (err) {
      console.error('Failed to initialize Firebase Admin. Ensure GOOGLE_APPLICATION_CREDENTIALS or ADC is set.', err);
      process.exit(1);
    }
  }
  const db = admin.firestore();

  async function purgeCollection(col) {
    const snap = await db.collection(col).get();
    let batch = db.batch();
    let count = 0;
    snap.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      if (count >= 400) { batch.commit(); batch = db.batch(); count = 0; }
    });
    if (count > 0) await batch.commit();
    console.log(`[Seeder] Purged ${col}: ${snap.size} docs`);
  }

  if (purge) {
    const cols = ['accounts','budgets','goals','subscriptions','transactions'];
    for (const c of cols) { await purgeCollection(c); }
  }

  async function writeBatch(col, docs, idField, transform = (d) => d) {
    const collection = db.collection(col);
    let batch = db.batch();
    let count = 0;
    for (const d of docs) {
      const data = transform(d);
      const id = idField ? data[idField] : undefined;
      const ref = id ? collection.doc(id) : collection.doc();
      batch.set(ref, data, { merge: true });
      count++;
      if (count >= 400) { await batch.commit(); batch = db.batch(); count = 0; }
    }
    if (count > 0) await batch.commit();
    console.log(`[Seeder] Wrote ${docs.length} to ${col}`);
  }

  await writeBatch('accounts', accounts, 'id');
  await writeBatch('goals', goals, 'id');
  await writeBatch('subscriptions', subscriptions, 'id');
  await writeBatch('budgets', budgets, null, (b) => ({
    ...b,
    id: `${b.userId}_${b.category}_${b.periodStart}`
  }));
  await writeBatch('transactions', transactions, 'id');

  console.log('[Seeder] Completed successfully');
}

main().catch(err => { console.error('[Seeder] Failed', err); process.exit(1); });
