import type { FastifyInstance } from 'fastify';
import { knex } from '../database/database.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {

    const transactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = transactionsSchema.parse(request.body);

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    });


    return reply.code(201).send();
  });

  app.get('/', async (request, reply) => {
    const transactions = await knex('transactions').select('*');

    return reply.code(200).send(transactions);
  });
}