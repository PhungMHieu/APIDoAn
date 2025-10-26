import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthSvcModule } from './../src/auth-svc.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthSvcModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const timestamp = Date.now();
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('username');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with duplicate username', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `duplicate_${timestamp}`,
        email: `duplicate_${timestamp}@example.com`,
        password: 'password123',
      };

      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same username
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userData,
          email: `different_${timestamp}@example.com`,
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeAll(async () => {
      // Register a test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'logintest',
          email: 'logintest@example.com',
          password: 'password123',
        });
    });

    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/validate (POST)', () => {
    let validToken: string;

    beforeAll(async () => {
      const timestamp = Date.now();
      // Register and login to get a token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `validatetest_${timestamp}`,
          email: `validatetest_${timestamp}@example.com`,
          password: 'password123',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: `validatetest_${timestamp}`,
          password: 'password123',
        });

      validToken = loginRes.body.access_token;
    });

    it('should validate a valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: validToken })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('sub');
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('roles');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let validToken: string;

    beforeAll(async () => {
      const timestamp = Date.now();
      // Register and login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `profiletest_${timestamp}`,
          email: `profiletest_${timestamp}@example.com`,
          password: 'password123',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: `profiletest_${timestamp}`,
          password: 'password123',
        });

      validToken = loginRes.body.access_token;
    });

    it('should get profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
