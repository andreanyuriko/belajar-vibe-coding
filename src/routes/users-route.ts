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
  .derive(({ headers }) => {
    const authHeader = headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    return { token };
  })
  .onBeforeHandle(({ token, set }) => {
    if (!token) {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  })
  .get('/api/users/current', async ({ token, set }) => {
    try {
      const user = await getCurrentUser(token!);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  })
  .get('/api/users/logout', async ({ token, set }) => {
    try {
      await logoutUser(token!);
      return { data: 'OK' };
    } catch (error: any) {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  });
