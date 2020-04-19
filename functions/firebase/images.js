const functions = require("firebase-functions");
const { db } = require("../server/admin");

//TODO:also change images in comments collection

/**
 * Change user's avatar on all posts when avatar is updated
 */
exports.onUserAvatarChange = functions
  .region("europe-west1")
  .firestore.document("/users/{userId}")
  .onUpdate(async (change) => {
    try {
      if (change.before.data().avatarUrl !== change.after.data().avatarUrl) {
        const batch = db.batch();

        const posts = await db
          .collection("posts")
          .where("username", "==", change.before.data().name)
          .get();

        const comments = await db
          .collection("comments")
          .where("username", "==", change.before.data().name)
          .get();

        posts.forEach((post) => {
          const newPost = db.doc(`/posts/${post.id}`);
          batch.update(newPost, { userAvatar: change.after.data().avatarUrl });
        });
        comments.forEach((comment) => {
          const newComment = db.doc(`/comments/${comment.id}`);
          batch.update(newComment, {
            userAvatar: change.after.data().avatarUrl,
          });
        });
        return batch.commit();
      } else {
        return true;
      }
    } catch (err) {
      console.error(err);
    }
  });
