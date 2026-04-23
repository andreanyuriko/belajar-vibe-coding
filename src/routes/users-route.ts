import { Elysia, t } from 'elysia';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../services/users-service';

export const usersRoute = new Elysia()
  .post(
    '/api/users',
    async ({ body, set }) => {
      try {
        await registerUser(body);
        return { data: 'OK' };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || 'Gagal registrasi' };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    '/api/users/login',
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);
        return { data: token };
      } catch (error: any) {
        set.status = 401;
        return { error: error.message || 'Gagal login' };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get('/api/users/current', async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'unauthorized' };
      }

      const token = authHeader.split(' ')[1];
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  })
  .get('/api/users/logout', async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'unauthorized' };
      }

      const token = authHeader.split(' ')[1];
      await logoutUser(token);
      return { data: 'OK' };
    } catch (error: any) {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  });
