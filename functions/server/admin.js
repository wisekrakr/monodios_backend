const admin = require("firebase-admin");

//init admin
var serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://monodios-2856f.firebaseio.com",
});

//init firestore database
const db = admin.firestore();

module.exports = { admin, db };
