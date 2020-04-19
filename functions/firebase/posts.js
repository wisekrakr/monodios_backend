const functions = require("firebase-functions");
const { db } = require("../server/admin");

/**
 * Delete all notifications for a post when post is deleted
 */
exports.onPostDeletion = functions
  .region("europe-west1")
  .firestore.document("/posts/{postId}")
  .onDelete(async (snapshot, context) => {
    try {
      const postId = context.params.postId;
      const batch = db.batch();

      const comments = await db
        .collection("comments")
        .where("postId", "==", postId)
        .get();
      const likes = await db
        .collection("likes")
        .where("postId", "==", postId)
        .get();
      const notifications = await db
        .collection("notifications")
        .where("postId", "==", postId)
        .get();

      comments.forEach((comment) => {
        batch.delete(db.doc(`/comments/${comment.id}`));
      });
      likes.forEach((like) => {
        batch.delete(db.doc(`/likes/${like.id}`));
      });
      notifications.forEach((not) => {
        batch.delete(db.doc(`/notifications/${not.id}`));
      });
      return batch.commit();
    } catch (err) {
      console.error(err);
    }
  });
