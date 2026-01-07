import type { FastifyInstance } from 'fastify';
import { knex } from '../database/database.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkCookieSessionId } from '../middlewares/checkCookieSessionId.js';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createBodyTransactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createBodyTransactionsSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days 
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.code(201).send();
  });

  app.get(
    '/:id',
    {
      preHandler: [checkCookieSessionId],
    }, 
    async (request, reply) => {
      try {
        const getTransactionParamsSchema = z.object({
          id: z.uuid({ version: 'v4' }),
        });

        const { id } = getTransactionParamsSchema.parse(request.params);

        const sessionId = request.cookies.sessionId;

        const transactionFind = await knex('transactions').where({
          id,
          session_id: sessionId,
        }).first();

        if (!transactionFind) {
          reply.code(404).send({ message: 'Transaction not found' });
        }

        return {
          transaction: transactionFind,
        };

      } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Internal Server Error' });
      }
    });

  app.get(
    '/',
    {
      preHandler: [checkCookieSessionId],
    }, 
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;
      const transactions = await knex('transactions').where('session_id', sessionId);

      return reply.code(200).send(transactions);
    });

  app.get(
    '/summary',
    {
      preHandler: [checkCookieSessionId],
    }, 
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;
      const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: 'amount' }).first();

      reply.code(200).send({
        summary,
      });
    });
}