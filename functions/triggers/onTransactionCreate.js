// add new transaction to user's monthly total and check against budgets

const functions = require('firebase-functions');
const admin = require('../lib/admin');
const utils = require('../lib/utils');
const { MONTHLY_BUDGET_LIMIT } = require('../config/constants');

exports.onTransactionCreate = functions.firestore
    .document('users/{userId}/transactions/{transactionId}')
    .onCreate(async (snap, context) => {
        // transaction data
        const { userId } = context.params;
        const transactionData = snap.data();
        const amount = transactionData.amount || 0;
        const category = transactionData.category || 'uncategorized';
        const timestamp = transactionData.timestamp || admin.firestore.FieldValue.serverTimestamp();
        const transactionDate = utils.toDate(timestamp);
        const monthStart = utils.getMonthStart(transactionDate);

        // update user's monthly spending total
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error(`User ${userId} not found for transaction ${context.params.transactionId}`);
            return;
        }

        const userData = userDoc.data();
        const monthlyTotals = userData.monthlyTotals || {};
        const monthKey = utils.formatMonthKey(monthStart);
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
        
        await userRef.update({ monthlyTotals });
    });
