const router = require("express").Router();
const { validationResult, check } = require("express-validator");

const firebase = require("../../server/firebase");
const { db } = require("../../server/admin");
const firebaseAuth = require("../../middleware/firebaseAuth");

// @route     GET api/auth
// @desc      Get user data
// @access    Private
router.get("/", async (req, res) => {
  try {
    const user = await db.doc(`/auth/${req.user.uid}`).get();

    res.json(user);
  } catch (err) {
    console.error(err.message + " in auth.js (GET) /auth");
    res.status(500).send("Server Error");
  }
});

/**
 *  @route POST api/auth
 *  @desc  Login a new user
 *  @access Public
 */
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        valid: Object.keys(errors).length === 0 ? true : false,
      });
    }

    const { email, password } = req.body;

    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (data) => {
        return await data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token });
      })
      .catch((err) => {
        console.error(err);
        // auth/wrong-password
        // auth/user-not-user
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      });
  }
);

module.exports = router;
