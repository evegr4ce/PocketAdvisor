// new user signup initialization
const admin = require("firebase-admin");
const db = admin.firestore();

function onUserCreate(user) {
  const userRef = db.collection("users").doc(user.uid);

  return userRef.set(
    {
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: "light",
        notifications: true,
      },
    },
    { merge: true }
  );
}

module.exports = onUserCreate;
