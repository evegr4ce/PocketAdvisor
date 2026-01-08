// export a function that returns all of the users information (mainly for use with the chatbot).

exports.getUserInfoByUsername = async function (username) {
    const admin = require('../lib/admin');

    const usersRef = admin.firestore().collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).limit(1).get();

    if (querySnapshot.empty) {
        throw new Error(`User with username ${username} not found.`);
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Return relevant user information
    return {
        age: userData.age || null,
        income: userData.income || null,
        monthlyBudget: userData.monthlyBudget || null,
        financialGoals: userData.financialGoals || null,
        spendingHabits: userData.spendingHabits || null,
        investmentPreferences: userData.investmentPreferences || null,
    };
}