// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // ✅ Your Express app
const userModel = require('../models/user.models');
const connectToDb = require('../db/db')

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

describe("POST /auth/register", () => {
    // beforeAll(async()=>{
    //     await connectToDb()
    // })
  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: "testuser",
        email: "testuser@gmail.com",
        password: "123456",
        fullname: { firstname: "Test", lastname: "User" }
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User register successfully");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("fullname");
    expect(res.body.user).toHaveProperty("email", "testuser@gmail.com");
    expect(res.body.user).toHaveProperty("username", "testuser");
    expect(res.body.user.password).toBeUndefined()
    expect(res.body.user.fullname).toHaveProperty("firstname", "Test");
    expect(res.body.user.fullname).toHaveProperty("lastname", "User");
  });

  it("should not register if email already exists", async () => {
    // create a user first
    await userModel.create({
      username: "duplicateuser",
      email: "duplicate@gmail.com",
      password: "hashedpwd",
      fullname: { firstname: "Test", lastname: "User" }
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        username: "anotheruser",
        email: "duplicate@gmail.com",
        password: "123456",
        fullname: { firstname: "Test", lastname: "User" }
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("username or email already exists");
  });

  it("should show validation error for missing fields", async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: "",
        email: "not-an-email",
        password: "12",
        fullname: { firstname: "", lastname: "" }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

});
