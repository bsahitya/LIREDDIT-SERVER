import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolver/post';
import { UserResolver } from './resolver/user';

import 'reflect-metadata';
import express from 'express';
import mikroOrmConfig from './mikro-orm.config';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { MyContext } from './types';

const main = async () => {
  // connect mikro-orm to postgres db
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  // initialize express app
  const app = express();

  // Initialize client.
  const redisClient = createClient();
  redisClient.connect().catch(console.error);

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
    disableTouch: true,
  });

  // Initialize session storage.
  app.use(
    session({
      name: 'qid',
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      secret: 'jhgsdutqwghagsdjafytqfjgv==',
    })
  );

  // create the apollo server for graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Served started on localhost:4000');
  });
};

main();
