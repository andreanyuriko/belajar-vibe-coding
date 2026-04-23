import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => ({
    message: 'Hello World from Elysia!',
    status: 'online',
    timestamp: new Date().toISOString(),
  }))
  .get('/health', () => 'OK')
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
