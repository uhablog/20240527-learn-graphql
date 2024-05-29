const { ApolloServer } = require('apollo-server-express');
const { readFileSync } = require('fs');
const express = require('express');
const expressPlayground = require(`graphql-playground-middleware-express`).default;

const resolvers = require('./resolvers');
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');

const app = express();

async function startApolloServer() {
  // サーバーのインスタンスを作成
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();
  server.applyMiddleware({app});

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

  app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
  );
}

startApolloServer();