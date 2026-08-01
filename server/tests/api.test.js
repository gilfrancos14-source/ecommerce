import request from 'supertest';
import app from '../src/app.js';

describe('Health Check', () => {
  it('should return API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth Endpoints', () => {
  const testUser = {
    nom: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.nom).toBe(testUser.nom);
    expect(res.body.token).toBeDefined();
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(400);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should not login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('should get current user with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should send reset password email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });
    expect(res.status).toBe(200);
  });

  it('should return success even for non-existent email (security)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
  });

  it('should logout successfully', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Product Endpoints', () => {
  it('should get products list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support pagination', async () => {
    const res = await request(app).get('/api/products?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBe(1);
  });

  it('should filter by category', async () => {
    const catsRes = await request(app).get('/api/categories');
    if (catsRes.body.data.length > 0) {
      const catId = catsRes.body.data[0].id;
      const res = await request(app).get(`/api/products?categoryId=${catId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});

describe('Category Endpoints', () => {
  it('should get categories list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
