import setupKnex from 'knex';
import type { Knex } from 'knex';

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: './temp/appDb.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './temp/migrations',
  },
};

export const knex = setupKnex(config);

