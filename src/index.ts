import { Elysia } from 'elysia';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(usersRoute)
  .get('/', () => ({
    message: 'Hello World from Elysia!',
    status: 'online',
    timestamp: new Date().toISOString(),
  }))
  .get('/health', () => 'OK');

if (import.meta.main) {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

