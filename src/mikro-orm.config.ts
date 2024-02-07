import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { Migrator } from '@mikro-orm/migrations';
import { User } from './entities/User';

import path from 'path';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  extensions: [Migrator],
  entities: [Post, User],
  dbName: 'lireddit',
  user: 'postgres',
  password: 'Jan@1995',
  driver: PostgreSqlDriver,
  debug: !__prod__,
};
