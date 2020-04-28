const { admin, db } = require("../server/admin");

// @req       requested  path
// @res       result of the request
// @next      when we are done with this middleware, we move on to the next middleware
const firebaseAuth = (req, res, next) => {
  let tokenId;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    tokenId = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(tokenId)
    .then((decodedToken) => {
      req.user = decodedToken;

      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.name = data.docs[0].data().name;
      req.user.avatarUrl = data.docs[0].data().avatarUrl;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token ", err);
      return res.status(403).json({ error: err, msg: "firebase auth failed" });
    });
};

module.exports = firebaseAuth;
