const router = require("express").Router();

const { db } = require("../../server/admin");
const firebaseAuth = require("../../middleware/firebaseAuth");

/** *
 *  @route GET api/posts/postId/like
 *  @desc  Add a like to a post
 *  @access Private
 */
router.get("/:postId/like", firebaseAuth, async (req, res) => {
  const likeDoc = db
    .collection("likes")
    .where("username", "==", req.user.name)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDoc = db.doc(`/posts/${req.params.postId}`);

  let postData;

  await postDoc
    .get()
    .then(async (doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return await likeDoc.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then(async (data) => {
      //if like does not exist we create it here
      if (data.empty) {
        return await db
          .collection("likes")
          .add({
            postId: req.params.postId,
            username: req.user.name,
          })
          .then(async () => {
            postData.likes++;
            return await postDoc.update({ likes: postData.likes });
          })
          .then(() => {
            return res.json(postData);
          });
        //if like already exists on this post
      } else {
        return res.status(400).json({ error: "Post already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
});

/** *
 *  @route GET api/posts/postId/unlike
 *  @desc  Unlike a post
 *  @access Private
 */
router.get("/:postId/unlike", firebaseAuth, async (req, res) => {
  const likeDoc = db
    .collection("likes")
    .where("username", "==", req.user.name)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDoc = db.doc(`/posts/${req.params.postId}`);

  let postData;

  await postDoc
    .get()
    .then(async (doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return await likeDoc.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then(async (data) => {
      //if like does not exist we cant unlike it
      if (data.empty) {
        return res.status(400).json({ error: "Post is not liked" });

        //if like exists on this post we will unlike it
      } else {
        return await db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.likes--;
            if (postData.likes < 0) {
              return res
                .status(404)
                .json({ error: "Likes are already at zero" });
            }
            return postDoc.update({ likes: postData.likes });
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
});

module.exports = router;
