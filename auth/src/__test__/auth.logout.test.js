// __test__/auth.logout.test.js
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const redis = require('../db/redis'); // make sure you export your redis client
const { logOutUser } = require('../controllers/auth.controller');

jest.mock('../db/redis', () => ({
  set: jest.fn(),
}));

const app = express();
app.use(cookieParser());
app.post('/auth/logout', logOutUser);

describe('POST /auth/logout', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should logout user and blacklist token if token exists', async () => {
    const token = 'sampleToken123';

    const res = await request(app)
      .post('/auth/logout')
      .set('Cookie', [`token=${token}`]);

    expect(redis.set).toHaveBeenCalledWith(
      `blacklist:${token}`,
      'true',
      'EX',
      24*60*60
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "user logged out successfully" });
    // Check cookie cleared
    expect(res.headers['set-cookie'][0]).toContain('token=;');
  });

  it('should logout user even if no token exists', async () => {
    const res = await request(app)
      .post('/auth/logout');

    expect(redis.set).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "user logged out successfully" });
    // Check cookie cleared
    expect(res.headers['set-cookie'][0]).toContain('token=;');
  });

});
