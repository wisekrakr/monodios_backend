const router = require("express").Router();
const functions = require("firebase-functions");

const { admin, db } = require("../../server/admin");
const firebaseAuth = require("../../middleware/firebaseAuth");

/** *
 *  @route POST api/notifications
 *  @desc  Mark a notification as read
 *  @access Private
 */
router.post("/", firebaseAuth, (req, res) => {
  let batch = db.batch();

  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ msg: "Notifications marked read" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

module.exports = router;
