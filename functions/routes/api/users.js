const router = require("express").Router();
const { validationResult, check } = require("express-validator");

const { db } = require("../../server/admin");
const firebaseConfig = require("../../config/config");
const firebase = require("../../server/firebase");

/** *
 *  @route POST api/users
 *  @desc  register a new user
 *  @access Private
 */
router.post(
  "/",
  [
    check("name", "Please add name").not().isEmpty(),

    check("email", "Invalid email").isEmail(),

    check("password", "invalid password")
      .isLength({ min: 4 })
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.passwordConfirm) {
          // trow error if passwords do not match
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //create a new user
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      name: req.body.name,
    };

    const placeholderAvatar = "profile-placeholder.png";

    //validate user
    let token, userId;

    await db
      .doc(`/users/${newUser.name}`)
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          return res
            .status(400)
            .json({ name: "this name has already been taken" });
        } else {
          return await firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then(async (data) => {
        userId = data.user.uid;
        return await data.user.getIdToken();
      })
      .then(async (tokenId) => {
        token = tokenId;
        const userCredentials = {
          name: newUser.name,
          email: newUser.email,
          createdAt: new Date().toISOString(),
          avatarUrl: urlForAvatar(
            firebaseConfig.storageBucket,
            placeholderAvatar
          ),
          userId,
        };
        return await db.doc(`/users/${newUser.name}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return res.status(400).json({ email: err.message });
        } else {
          return res
            .status(500)
            .json({ general: "Something went wrong. Please try again later" });
        }
      });
  }
);

module.exports = router;
