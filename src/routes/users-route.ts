import { Elysia, t } from 'elysia';
import { registerUser, loginUser } from '../services/users-service';

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
  );
