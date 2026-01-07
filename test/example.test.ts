import { expect, test, beforeAll, beforeEach, afterAll, describe } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';


beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  execSync('npm run knex migrate:rollback --all');
  execSync('npm run knex migrate:latest');
});

describe('tests - transactionsRoute', () => {
  test('Should be able to create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      });

    expect(response.statusCode).toEqual(201);
  });

  test('Should be able to list all transactions', async () => {
    const titleTest = 'new transaction test';
    const amountTest = 5000;

    const transactionCreated = await request(app.server)
      .post('/transactions')
      .send({
        title: titleTest,
        amount: amountTest,
        type: 'credit',
      }).expect(201);

    const cookies = transactionCreated.get('Set-Cookie') || [];

    const listTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(listTransactions.statusCode).toBe(200);
    expect(listTransactions.body).toEqual([
      expect.objectContaining({
        title: titleTest,
        amount: amountTest,
      }),
    ]);
  });

  test('Should be able to consult one transaction', async () => {
    const titleTest = 'new transaction test';
    const amountTest = 5000;

    const transactionCreated = await request(app.server)
      .post('/transactions')
      .send({
        title: titleTest,
        amount: amountTest,
        type: 'credit',
      }).expect(201);

    const cookies = transactionCreated.get('Set-Cookie') || [];

    const listTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies).expect(200);

    const transactionId = listTransactions.body[0].id;

    const consultTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(consultTransactionResponse.statusCode).toBe(200);
    expect(consultTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: titleTest,
        amount: amountTest, 
      }),
    );
  });

  test('Should be able to consult a summary', async () => {
    const titleTest = 'new transaction test';
    const amountTest = 5000;

    const transactionCreated = await request(app.server)
      .post('/transactions')
      .send({
        title: titleTest,
        amount: amountTest,
        type: 'credit',
      }).expect(201);

    const cookies = transactionCreated.get('Set-Cookie') || [];

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies);

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.body).toEqual({
      summary: {
        amount: amountTest,
      },
    });
  });
});
