// update budget function

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.updateBudget = functions.https.onCall(async (data, context) => {
  const { budgetId, newAmount } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  if (typeof budgetId !== "string" || typeof newAmount !== "number") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid budgetId or newAmount."
    );
  }

  const budgetRef = db.collection("budgets").doc(budgetId);
  const budgetDoc = await budgetRef.get();

  if (!budgetDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Budget not found.");
  }

  await budgetRef.update({
    amount: newAmount,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Budget updated successfully." };
});
