import { describe, expect, it, beforeEach } from 'bun:test';
import { app } from '../src';
import { clearDatabase } from './test-utils';

describe('User API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/users (Registration)', () => {
    it('should register a new user successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBe('OK');
    });

    it('should fail if email already exists', async () => {
      // First registration
      await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Jane Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Email sudah terdaftar');
    });

    it('should fail if fields are missing', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            // email and password missing
          }),
        })
      );

      expect(response.status).toBe(422); // Elysia validation error status
    });

    it('should fail if name exceeds 255 characters', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'A'.repeat(300),
            email: 'long@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Login User',
            email: 'login@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should login successfully with correct credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'login@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBeDefined(); // token
    });

    it('should fail with wrong password', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'login@example.com',
            password: 'wrongpassword',
          }),
        })
      );

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('Email atau Password salah');
    });
  });

  describe('GET /api/users/current', () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Profile User',
            email: 'profile@example.com',
            password: 'password123',
          }),
        })
      );

      const loginRes = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'profile@example.com',
            password: 'password123',
          }),
        })
      );
      const result = await loginRes.json();
      token = result.data;
    });

    it('should get current user profile with valid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data.email).toBe('profile@example.com');
      expect(result.data.password).toBeUndefined();
    });

    it('should fail with invalid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: 'Bearer invalid-token' },
        })
      );

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('unauthorized');
    });

    it('should fail without authorization header', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/logout', () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Logout User',
            email: 'logout@example.com',
            password: 'password123',
          }),
        })
      );

      const loginRes = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'logout@example.com',
            password: 'password123',
          }),
        })
      );
      const result = await loginRes.json();
      token = result.data;
    });

    it('should logout successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBe('OK');

      // Verify token is no longer valid
      const currentRes = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(currentRes.status).toBe(401);
    });
  });
});
