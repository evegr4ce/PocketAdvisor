const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Callable function to reset demo seed data by clearing collections.
exports.resetSeedData = functions.https.onCall(async (data, context) => {
  const auth = context.auth;
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const claims = auth.token || {};
  if (!claims.admin && !claims.demo) {
    throw new functions.https.HttpsError('permission-denied', 'Admin or demo claim required');
  }

  const targetCollections = data && Array.isArray(data.collections)
    ? data.collections
    : ['users','accounts','budgets','goals','subscriptions','transactions'];

  const deleted = {};
  for (const col of targetCollections) {
    const snap = await db.collection(col).get();
    let batch = db.batch();
    let count = 0;
    snap.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      if (count >= 400) { batch.commit(); batch = db.batch(); count = 0; }
    });
    if (count > 0) await batch.commit();
    deleted[col] = snap.size;
  }
  return { status: 'ok', deleted };
});

// Optional: count documents for quick health checks.
exports.seedCounts = functions.https.onCall(async (_, context) => {
  const auth = context.auth;
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const cols = ['users','accounts','budgets','goals','subscriptions','transactions'];
  const counts = {};
  for (const c of cols) {
    const snap = await db.collection(c).limit(1).get();
    // No direct count API; fetch first page and use size for small datasets.
    counts[c] = snap.size; // for demo; replace with Aggregation or count() when available
  }
  return { counts };
});
