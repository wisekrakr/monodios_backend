const functions = require("firebase-functions");
const { db } = require("../server/admin");

/**
 * Notify user of a like on user's post
 */
exports.showNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const post = await db.doc(`/posts/${snapshot.data().postId}`).get();

      if (post.exists && post.data().username !== snapshot.data().username) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: post.data().username,
          sender: snapshot.data().username,
          type: "like",
          read: false,
          postId: post.id,
        });
      }
    } catch (error) {
      console.error(err);
    }
  });

/**
 * Clear the notification if post is unliked
 */
exports.clearNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete(async (snapshot) => {
    try {
      await db.doc(`/notifications/${snapshot.id}`).delete();
    } catch (err) {
      console.error(err);
    }
  });

/**
 * Notify user of a comment on user's post
 */
exports.showNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const post = await db.doc(`/posts/${snapshot.data().postId}`).get();

      if (post.exists && post.data().username !== snapshot.data().username) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: post.data().username,
          sender: snapshot.data().username,
          type: "comment",
          read: false,
          postId: post.id,
        });
      }
    } catch (error) {
      console.error(err);
    }
  });
