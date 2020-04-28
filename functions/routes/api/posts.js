const router = require("express").Router();
const { validationResult, check } = require("express-validator");
const path = require("path");
const os = require("os");
const fs = require("fs");
const BusBoy = require("busboy");

const { admin, db } = require("../../server/admin");
const firebaseConfig = require("../../config/config");
const firebaseAuth = require("../../middleware/firebaseAuth");
const { urlForAudio, urlForImage } = require("../../utils/urlSetter");
const websiteUrlValidator = require("../../utils/websiteUrlValidator");

/** *
 *  @route GET api/posts
 *  @desc  Get all the posts from the database
 *  @access Public
 */
router.get("/", async (req, res) => {
  try {
    const posts = await db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    if (posts.size > 0) {
      let postsShow = [];

      posts.forEach((doc) => {
        postsShow.push({
          postId: doc.id,
          ...doc.data(),
        });
      });

      return res.json(postsShow);
    }
  } catch (error) {
    console.error(err);
  }
});

/** *
 *  @route GET api/posts/:id
 *  @desc  Get a post from the database and fetch the comments of that post
 *  @access Public
 */
router.get("/:postId", async (req, res) => {
  let postData = {};

  await db
    .doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data.forEach((doc) => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

/** *
 *  @route POST api/posts
 *  @desc  Create a new post and add it to the database
 *  @access Private
 */
router.post(
  "/",
  firebaseAuth,
  [
    check("description", "Please explain your project").notEmpty(),
    check("title", "Please add a title").notEmpty(),
    check("genre", "Please add any genre").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newPost = {
      description: req.body.description,
      username: req.user.name,
      title: req.body.title,
      genre: req.body.genre,
      createdAt: new Date().toISOString(),
      userAvatar: req.user.avatarUrl,
      video: req.body.video !== null ? beautifyUrl(req.body.video) : null,
      comments: 0,
      likes: 0,
    };

    try {
      await db
        .collection("posts")
        .add(newPost)
        .then(async (doc) => {
          const postResponse = newPost;
          postResponse.postId = doc.id;

          await res.json(postResponse);
        });
    } catch (err) {
      res.status(500).json({ error: `Server Error: ${err}` });
      console.error(err);
    }
  }
);

/** *
 *  @route DELETE api/posts/:postId
 *  @desc  Delete a post
 *  @access Private
 */
router.delete("/:postId", firebaseAuth, async (req, res) => {
  const post = db.doc(`/posts/${req.params.postId}`);

  try {
    const postToDelete = await post.get();

    if (postToDelete === null) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (postToDelete.data().username !== req.user.name) {
      return res.status(403).json({ error: "Unauthorized" });
    } else {
      res.json({ msg: "Post deleted successfully" });
      return await post.delete();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err.code}` });
  }
});

/** *
 *  @route POST api/posts/:id/audio
 *  @desc  upload audio for certain post
 *  @access Private
 */
router.post("/:postId/audio", firebaseAuth, (req, res) => {
  const busboy = new BusBoy({ headers: req.headers });

  let audioFileName, audioForUploading;

  busboy.on("file", (fieldname, file, filename, enconding, mimetype) => {
    if (mimetype !== "audio/mpeg" && mimetype !== "audio/wav") {
      return res.status(400).json({
        error: "Only submit these types of audio files: mp3/wav",
      });
    }

    //postId.audio.mp3
    const audioFile = filename.split(".")[filename.split(".").length - 1];
    // 735628736100.mp3
    audioFileName = `${Math.round(Math.random() * 100000000000)}.${audioFile}`;
    const filepath = path.join(os.tmpdir(), audioFileName);
    audioForUploading = { filepath, mimetype };

    //using filesystem to create the file
    file.pipe(fs.createWriteStream(filepath));
  });

  //upload the file
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(audioForUploading.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: audioForUploading.mimetype,
          },
        },
      })
      .then(() => {
        const audioUrl = urlForAudio(
          firebaseConfig.storageBucket,
          audioFileName
        );
        return db.doc(`/posts/${req.params.postId}`).update({ audioUrl });
      })
      .then(() => {
        return res.json({ message: "Audio uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
});

/** *
 *  @route POST api/posts/:id/image
 *  @desc  upload video for certain post
 *  @access Private
 */
router.post("/:postId/image", firebaseAuth, (req, res) => {
  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName, imageForUploading;

  busboy.on("file", (fieldname, file, filename, enconding, mimetype) => {
    if (
      mimetype !== "image/jpg" &&
      mimetype !== "image/bmp" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif"
    ) {
      return res.status(400).json({
        error: "Only submit these types of image files: jpg/bmp/png/gif",
      });
    }

    //postId.audio.mp3
    const imageFile = filename.split(".")[filename.split(".").length - 1];
    // 735628736100.mp3
    imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageFile}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageForUploading = { filepath, mimetype };

    //using filesystem to create the file
    file.pipe(fs.createWriteStream(filepath));
  });

  //upload the file
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageForUploading.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageForUploading.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = urlForImage(
          firebaseConfig.storageBucket,
          imageFileName
        );
        return db.doc(`/posts/${req.params.postId}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Video uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
});

module.exports = router;
