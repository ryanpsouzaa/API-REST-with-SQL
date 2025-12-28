import fastify from 'fastify';
import cookies from '@fastify/cookie';
import { env } from './env/index.js';
import { transactionsRoutes } from './routes/transactions.js';

const app = fastify();

app.register(cookies);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app.listen({
  port: env.PORT,

}).then(()=> {
  console.log('HTTP Server is running');
});