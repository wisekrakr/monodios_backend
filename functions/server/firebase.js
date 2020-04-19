//init firebase
const firebase = require("firebase");
firebase.initializeApp(require("../config/config"));

module.exports = firebase;
