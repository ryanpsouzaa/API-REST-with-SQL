import type { FastifyInstance } from 'fastify';
import { knex } from '../database/database.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {

    const createBodyTransactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createBodyTransactionsSchema.parse(request.body);

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,

    });

    return reply.code(201).send();
  });

  app.get('/:id', async (request, reply) => {
    try {
      const getTransactionParamsSchema = z.object({
        id: z.uuid({ version: 'v4' }),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transactionFind = await knex('transactions').where('id', id).first();

      return reply.code(200).send({
        transaction: transactionFind,
      });

    } catch(err){
      console.error(err);
      return reply.code(500).send({message: 'Internal Server Error'});
    }
  });

  app.get('/', async (request, reply) => {
    const transactions = await knex('transactions').select('*');

    return reply.code(200).send(transactions);
  });

  app.get('/summary', async (request, reply) => {
    const summary = await knex('transactions').sum('amount', {as: 'amount'}).first();

    reply.code(200).send({
      summary,
    });
  });
}