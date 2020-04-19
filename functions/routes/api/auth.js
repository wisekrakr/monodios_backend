const router = require("express").Router();
const { validationResult, check } = require("express-validator");

const firebase = require("../../server/firebase");

/**
 *  @route POST api/auth
 *  @desc  Login a new user
 *  @access Private
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
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      const token = await firebase.auth().currentUser.getIdToken();

      return res.json({ token });
    } catch (err) {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Something went wrong. Please try again later." });
    }
  }
);

module.exports = router;
