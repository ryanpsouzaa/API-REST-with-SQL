import fastify from 'fastify';
import { knex } from './database/database.js';

const app = fastify();

app.get('/hello', async () => {
  const test = await knex('sqlite_schema').select('*');

  return test;
});

app.listen({
  port: 3000,

}).then(()=> {
  console.log('HTTP Server is running');
});