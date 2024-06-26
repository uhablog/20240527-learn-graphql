const { GraphQLScalarType } = require('graphql');
const { authorizeWithGithub } = require('../libs');
require('dotenv').config();

let _id = 0;

let users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup"},
  { "githubLogin": "gPlake", "name": "Glen Plake"},
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt"},
];

let photos = [
  {
    "id": "1",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake",
    "created": "3-28-1977"
  },
  {
    "id": "2",
    "name": "Enjoying the sunshine",
    "category": "SELFIE",
    "githubUser": "sSchmidt",
    "created": "1-2-1985"
  },
  {
    "id": "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunbarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
    "created": "2018-04-15T19:09:57.308Z"
  },
];

let tags = [
  { "photoID": "1", "userID": "gPlake" },
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" },
]

const resolvers = {
  Query: {
    me: (parent, args, { currentUser }) => currentUser,
    totalPhotos: (parent, args, { db }) => {
      console.log('totalphoto');
      return db.collection('photos')
        .estimatedDocumentCount()
    },
    allPhotos: (parent, args, { db }) => {
      console.log('allphotos');
      return db.collection('photos')
        .find()
        .toArray()
    },
    totalUsers: (parent, args, { db }) =>
      db.collection('users')  
        .estimatedDocumentCount(),
    allUsers: (parent, args, { db }) =>
      db.collection('users')
        .find()
        .toArray()
  },

  Mutation: {
    async postPhoto(parent, args, { db, currentUser, pubsub }) {

      if (!currentUser) {
        throw new Error('only an authorized user can post a photo');
      }

      const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date()
      }

      const { insertedId } = await db.collection('photos').insertOne(newPhoto);
      newPhoto.id = insertedId;

      pubsub.publish('photo-added', { newPhoto });

      return newPhoto;
    },

    async githubAuth(parent, { code }, { db }) {
      console.log(`githubAuth resolver started. code is ${code}`);
      let {
        message,
        access_token,
        avatar_url,
        login,
        name
      } = await authorizeWithGithub({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      });

      if (message) {
        throw new Error(message);
      }

      const latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
      }

      const result = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      let user;

      if (result.acknowledged) {
        if (result.upsertedId) {
          user = await db.collection('users').findOne({_id: result.upsertedId._id});
        } else {
          user = await db.collection('users').findOne({githubLogin: login});
        }
      } else {
        console.error('Document replace failed');
      }

      return { user, token: access_token }
    },
    async addFakeUsers(parent, { count }, {db}) {
      const randomUserApi = `https://randomuser.me/api/?results=${count}`;
      const { results } = await fetch(randomUserApi)
        .then(res => res.json());
      
        const users = results.map(r => ({
          githubLogin: r.login.username,
          name: `${r.name.first} ${r.name.last}`,
          avatar: r.picture.thumbnail,
          githubToken: r.login.sha1
        }));

        await db.collection('users').insertMany(users);
        return users;
    },
    async fakeUserAuth(parent, { githubLogin }, { db }) {
      const user = await db.collection('users').findOne({ githubLogin });

      if (!user) {
        throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
      }

      return {
        token: user.githubToken,
        user
      }
    }
  },
  Subscription: {
    newPhoto: {
      subscribe: (parent, args, { pubsub }) =>
        pubsub.asyncIterator(['photo-added'])
    }
  },
  Photo: {
    id: parent => parent.id || parent._id,
    url: parent => `/img/photos/${parent._id}.jpg`,
    postedBy: ( parent, args, { db }) => 
      db.collection('users').findOne({ githubLogin: parent.userID })
    ,
    taggedUsers: parent => tags
      .filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin);
    },
    inPhotos: parent => tags
      .filter(tag => tag.userID === parent.id)
      .map(tag => tag.photoID)
      .map(photoID => photos.find(p => p.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

module.exports = resolvers;