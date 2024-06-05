const { MongoClient } = require('mongodb');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { readFileSync } = require('fs');
const express = require('express');
const expressPlayground = require(`graphql-playground-middleware-express`).default;

const { createServer } = require('http');
const { PubSub } = require('graphql-subscriptions');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const resolvers = require('./resolvers');
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
require('dotenv').config();


async function startApolloServer() {
  try {

    const schema = makeExecutableSchema({typeDefs, resolvers});
    const MONGO_DB = process.env.DB_HOST;
    const client = await MongoClient.connect(
      MONGO_DB,
      { useNewUrlParser: true }
    );
    const db = client.db();
    const pubsub = new PubSub();

    const app = express();
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));
    app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

    const httpServer = createServer(app);

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/subscriptions'
    });

    const serverCleanup = useServer({schema}, wsServer);

    const server = new ApolloServer({
      // typeDefs,
      // resolvers,
      schema,
      context: async ({ req, connection }) => {
        const githubToken = req ?
          req.headers.authorization :
          connection.context.Authorization;
        const currentUser = await db.collection('users').findOne({ githubToken })
        return { db, currentUser, pubsub }
      },
      plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });

    await server.start();
    server.applyMiddleware({app});


    // SubscriptionServer.create({
    //   schema: server.schema,
    //   execute,
    //   subscribe,
    //   onConnect: () => console.log('Client connected for subscriptions'),
    // }, {
    //   server: httpServer,
    //   path: server.graphqlPath
    // });

    httpServer.listen({ port: 4000 }, () => {
      console.log(`GraphQL Server running at localhost:4000${server.graphqlPath}`)
      console.log(`Subscriptions ready at ws:localhost:4000${server.graphqlPath}`)
    });
  } catch (error) {
    console.error('サーバーの起動でエラー発生：', error);
  }
}

startApolloServer();