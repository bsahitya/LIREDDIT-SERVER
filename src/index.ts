import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolver/post';
import { UserResolver } from './resolver/user';

import 'reflect-metadata';
import express from 'express';
import mikroOrmConfig from './mikro-orm.config';

const main = async () => {
  // connect mikro-orm to postgres db
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  // initialize express app
  const app = express();

  // create the apollo server for graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em.fork() }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Served started on localhost:4000');
  });
};

main();
