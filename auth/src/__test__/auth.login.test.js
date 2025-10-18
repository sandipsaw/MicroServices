const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // ✅ Your Express app
const userModel = require('../models/user.models');
const connectToDb = require('../db/db')
const bcrypt = require('bcryptjs')

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET="test_jwt_secret"
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await userModel.deleteMany();
});

describe('POST /auth/login',()=>{
    it('login with correct credential and return 200 with user and set cookies',async()=>{
        const password = 'secret123';
        const hash = await bcrypt.hash(password,10);
        await userModel.create({
            username:"sandy_sharma",
            email:"sandy@example.com",
            password:hash,
            fullname:{
                firstname:"sandy",
                lastname:"sharma",
            },
        });
        const res = await request(app)
        .post('/auth/login')
        .send({email:"sandy@example.com",password})

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message","user looged in successfully");
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe("sandy@example.com");

        const setCookie = res.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(setCookie.join(';')).toMatch(/token=/);
    })
    it('reject wrong password with 401',async()=>{
        const password = 'secret123';
        const hash =await bcrypt.hash(password,10);
        await userModel.create({
            username:"sandy_sharma",
            email:"sandy@example.com",
            password:hash,
            fullname:{
                firstname:"sandy",
                lastname:"sharma",
            },
        });
        const res = await request(app)
        .post('/auth/login')
        .send({ email:"sandy@example.com",password:"wrongpass1"});

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message","Invalid password")
    })

    it('validate missing field with 400',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({})

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    })
})