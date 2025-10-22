const request = require('supertest');
const app = require('../src/app');
const connectToDb = require('../src/db/db');

// Ensure the server doesn't start; we use app directly

describe('POST /api/auth/register', () => {
    beforeAll(async () => {
        // connectDB uses process.env.MONGO_URI set in setup.js
        await connectToDb();
    });

    it('creates a user and returns 201 with user (no password)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'john_doe',
                email: 'john@example.com',
                password: 'Secret123!',
                fullname: { firstname: 'John', lastname: 'Doe' },
            });

        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe('john_doe');
        expect(res.body.user.email).toBe('john@example.com');
        expect(res.body.user.password).toBeUndefined();
    });

    it('rejects duplicate username/email with 409', async () => {
        const payload = {
            username: 'dupuser',
            email: 'dup@example.com',
            password: 'Secret123!',
            fullname: { firstname: 'Dup', lastname: 'User' },
        };

        await request(app).post('/api/auth/register').send(payload).expect(201);
        const res = await request(app).post('/api/auth/register').send(payload);

        expect(res.status).toBe(409);
    });

    it('validates missing fields with 400', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        expect(res.status).toBe(400);
    });
});