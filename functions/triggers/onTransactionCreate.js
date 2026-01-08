// add new transaction to user's monthly total

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

        // Check if user is over budget and send notification
        const totalThisMonth = monthlyTotals[monthKey];

        if (totalThisMonth > MONTHLY_BUDGET_LIMIT) {
            // send email notification to user
            const userEmail = userData.email;
            if (userEmail) {
                const mailOptions = {
                    from: 'noreply@pocketadvisor.com',
                    to: userEmail,
                    subject: 'Budget Alert: Monthly Limit Exceeded',
                    text: `Dear User,\n\nYou have exceeded your monthly budget limit of $${MONTHLY_BUDGET_LIMIT}. Your total spending for this month is $${totalThisMonth}.\n\nPlease review your expenses and adjust your budget accordingly.\n\nBest regards,\nPocketAdvisor Team`,
                };
                await admin.firestore().collection('mail').add(mailOptions);
                console.log(`Budget alert email sent to ${userEmail} for user ${userId}`);
            } else {
                console.error(`No email found for user ${userId} to send budget alert.`);
            }
        }
    });
