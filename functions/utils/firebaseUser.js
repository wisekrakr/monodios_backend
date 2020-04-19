module.exports = firebaseUser = (firebase) =>
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      return (user = firebase.auth().currentUser);
    }
  });
