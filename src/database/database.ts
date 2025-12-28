import setupKnex from 'knex';
import type { Knex } from 'knex';
import { env } from '../env/index.js';

if(!process.env.DATABASE_URL_NODE){
  throw new Error('Database URL not defined');
};

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL_NODE,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './temp/migrations',
  },
};
export const knex = setupKnex(config);

