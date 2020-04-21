const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const showNotificationOnLike = require("./firebase/notification");
const showNotificationOnComment = require("./firebase/notification");
const clearNotificationOnLike = require("./firebase/notification");
const onUserAvatarChange = require("./firebase/images");
const onPostDeletion = require("./firebase/posts");

//init express app
const app = express();

// Bodyparser Middleware
app.use(express.json({ extended: false }));
app.use(cors());

//all api routes
app.use("/auth", require("./routes/api/auth"));
app.use("/users", require("./routes/api/users"));
app.use("/profile", require("./routes/api/profile"));

app.use("/posts", require("./routes/api/posts"));
app.use("/posts", require("./routes/api/comments"));
app.use("/posts", require("./routes/api/likes"));

app.use("/notifications", require("./routes/api/notifications"));

exports.api = functions.region("europe-west1").https.onRequest(app);
exports.showNotificationOnLike = showNotificationOnLike.showNotificationOnLike;
exports.showNotificationOnComment =
  showNotificationOnComment.showNotificationOnComment;
exports.clearNotificationOnLike =
  clearNotificationOnLike.clearNotificationOnLike;
exports.onUserAvatarChange = onUserAvatarChange.onUserAvatarChange;
exports.onPostDeletion = onPostDeletion.onPostDeletion;
