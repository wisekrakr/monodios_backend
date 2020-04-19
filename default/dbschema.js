let db = {
  users: [
    {
      userId: "Og68y3IY6uS416lc3CSVEZoTKsA2",
      email: "test@test.com",
      name: "test",
      bio: "I am an app tester",
      website: "www.test.com",
      avatarUrl:
        "https://raw.githubusercontent.com/wisekrakr/portfolio_res/master/images/dd_logo_solo.png",
      location: "Rotterdam, NL",
      createdAt: "2020-04-15T03:50:14.295Z",
    },
  ],
  posts: [
    {
      username: "test",
      title: "post title",
      description: "post description",
      genre: "alternative rock",
      userAvatar:
        "https://raw.githubusercontent.com/wisekrakr/portfolio_res/master/images/dd_logo_solo.png",
      audio:
        "https://raw.githubusercontent.com/wisekrakr/portfolio_res/master/media/music/bossman.mp3",
      image:
        "https://raw.githubusercontent.com/wisekrakr/portfolio_res/master/images/dd_logo_solo.png",
      video: "https://www.youtube.com/watch?v=t0c_q76blQ0",
      createdAt: "2020-04-15T03:50:14.295Z",
      likes: 5,
      comments: 2,
    },
  ],
  comments: [
    {
      username: "test",
      postId: "NbTGh0okFJqhkiwZiufR",
      body: "make love to me!",
      createdAt: "2020-04-15T04:41:00.170Z",
    },
  ],
  notifications: [
    {
      recipient: "test",
      sender: "bla",
      read: "true | false",
      postId: "NbTGh0okFJqhkiwZiufR",
      type: "like | comment",
      createdAt: "2020-04-15T04:41:00.170Z",
    },
  ],
};

const profileDetails = {
  //Redux data
  credentials: {
    userId: "Og68y3IY6uS416lc3CSVEZoTKsA2",
    email: "test@test.com",
    name: "tetst",
    createdAt: "2020-04-15T03:50:14.295Z",
    avatarUrl:
      "https://raw.githubusercontent.com/wisekrakr/portfolio_res/master/images/dd_logo_solo.png",
    bio: "I am an app tester",
    website: "https://test.com",
    location: "Rotterdam, NL",
  },
  likes: [
    {
      name: "test",
      postId: "NbTGh0okFJqhkiwZiufR",
    },
  ],
};
