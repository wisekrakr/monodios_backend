urlForAvatar = (storageBucket, avatar) => {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${avatar}?alt=media`;
};

urlForAudio = (storageBucket, audio) => {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${audio}?alt=media`;
};

urlForVideo = (storageBucket, video) => {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${video}?alt=media`;
};

urlForImage = (storageBucket, image) => {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${image}?alt=media`;
};

module.exports = { urlForAvatar, urlForAudio, urlForVideo, urlForImage };
