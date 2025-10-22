const request = require('supertest');
const app = require('../src/app');
const connectToDb = require('../src/db/db');
const userModel = require('../src/models/user.models');
const bcrypt = require('bcryptjs');

describe('POST /api/auth/login', () => {
    beforeAll(async () => {
        await connectToDb();
    });

    it('logs in with correct credentials and returns 200 with user and sets cookie', async () => {
        // Seed a user
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);
        await userModel.create({
            username: 'jane_doe',
            email: 'jane@example.com',
            password: hash,
            fullname: { firstname: 'Jane', lastname: 'Doe' },
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'jane@example.com', password });

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('jane@example.com');
        // cookie should be set
        const setCookie = res.headers[ 'set-cookie' ];
        expect(setCookie).toBeDefined();
        expect(setCookie.join(';')).toMatch(/token=/);
    });

    it('rejects wrong password with 401', async () => {
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);
        await userModel.create({
            username: 'jack_smith',
            email: 'jack@example.com',
            password: hash,
            fullname: { firstname: 'Jack', lastname: 'Smith' },
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'jack@example.com', password: 'WrongPass1!' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid password');
    });

    it('validates missing fields with 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});