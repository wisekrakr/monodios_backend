const router = require("express").Router();
const { validationResult, check } = require("express-validator");

const { db } = require("../../server/admin");
const firebaseAuth = require("../../middleware/firebaseAuth");

/** *
 *  @route POST api/posts/postId/comment
 *  @desc  Create a comment on a post
 *  @access Private
 */
router.post(
  "/:postId/comment",
  firebaseAuth,
  [check("body", "Please add a comment").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newComment = {
      body: req.body.body,
      username: req.user.name,
      createdAt: new Date().toISOString(),
      postId: req.params.postId,
      userAvatar: req.user.avatarUrl,
    };

    await db
      .doc(`/posts/${req.params.postId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: "Post not found" });
        }
        return doc.ref.update({ comments: doc.data().comments + 1 });
      })
      .then(async () => {
        return await db.collection("comments").add(newComment);
      })
      .then(async () => {
        await res.json(newComment);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: `Server Error: ${err.code}` });
      });
  }
);

module.exports = router;
