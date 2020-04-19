const router = require("express").Router();
const { validationResult, check } = require("express-validator");
const path = require("path");
const os = require("os");
const fs = require("fs");
const BusBoy = require("busboy");

const { admin, db } = require("../../server/admin");
const firebaseConfig = require("../../config/config");
const firebaseAuth = require("../../middleware/firebaseAuth");
const { urlForAvatar } = require("../../utils/urlSetter");
const beautifyUrl = require("../../utils/websiteUrlValidator");

//TODO:  create different routes for image / audio / video uploading

/** *
 *  @route GET api/profile
 *  @desc  get own user's profile and push likes and notifications into user profile details
 *  @access Private
 */
router.get("/", firebaseAuth, async (req, res) => {
  let userData = {};

  try {
    const user = await db.doc(`/users/${req.user.name}`).get();

    if (user.exists) {
      userData.credentials = user.data();

      //add likes to profile details
      const likes = await db
        .collection("likes")
        .where("username", "==", req.user.name)
        .get();

      userData.likes = [];
      likes.forEach((like) => {
        userData.likes.push(like.data());
      });

      //add notifications to profile details
      const nots = await db
        .collection("notifications")
        .where("recipient", "==", req.user.name)
        .orderBy("createdAt", "desc")
        .get();

      userData.notifications = [];
      nots.forEach((not) => {
        userData.notifications.push({
          notificationId: not.id,
          ...not.data(),
        });
      });
      return res.json(userData);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
});

/** *
 *  @route GET api/profile/:name
 *  @desc  Get user's profile details by name
 *  @access Public
 */
router.get("/:name", async (req, res) => {
  let userData = {};

  try {
    const user = await db.doc(`/users/${req.params.name}`).get();

    if (user.exists) {
      userData.user = user.data();
      const posts = await db
        .collection("posts")
        .where("username", "==", req.params.name)
        .orderBy("createdAt", "desc")
        .get();

      userData.posts = [];
      posts.forEach((post) => {
        userData.posts.push({
          postId: post.id,
          ...post.data(),
        });
      });
      return res.json(userData);
    } else {
      return res.status(404).json({ error: "User does not exist" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
});

/** *
 *  @route POST api/profile
 *  @desc  update user profile details
 *  @access Private
 */
router.post(
  "/",
  firebaseAuth,
  [
    check("bio", "Tell something about yourself").notEmpty(),
    check("website", "Enter a valid url for your website").notEmpty().isURL(),
    check("location", "Where does your bed sleep?").notEmpty(),
  ],

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //beautify website url
    req.body.website = beautifyUrl(req.body.website);

    db.doc(`/users/${req.user.name}`)
      .update(req.body)
      .then(() => {
        return res.json({ message: "Profile Updated!" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  }
);

/** *
 *  @route POST api/profile/avatar
 *  @desc  upload avatar for user
 *  @access Private
 */
router.post("/avatar", firebaseAuth, (req, res) => {
  const busboy = new BusBoy({ headers: req.headers });

  let avatarFileName, avatarForUploading;

  busboy.on("file", (fieldname, file, filename, enconding, mimetype) => {
    if (
      mimetype !== "image/jpg" &&
      mimetype !== "image/jpeg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif"
    ) {
      return res.status(400).json({
        error: "Only submit these types of image files: jpg/jpeg/png/gif",
      });
    }

    //user.avatar.png
    const avatarFile = filename.split(".")[filename.split(".").length - 1];
    // 735628736100.png
    avatarFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${avatarFile}`;
    const filepath = path.join(os.tmpdir(), avatarFileName);
    avatarForUploading = { filepath, mimetype };

    //using filesystem to create the file
    file.pipe(fs.createWriteStream(filepath));
  });

  //upload the file
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(avatarForUploading.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: avatarForUploading.mimetype,
          },
        },
      })
      .then(() => {
        const avatarUrl = urlForAvatar(
          firebaseConfig.storageBucket,
          avatarFileName
        );
        return db.doc(`/users/${req.user.name}`).update({ avatarUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
});

module.exports = router;
