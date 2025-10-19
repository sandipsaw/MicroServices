const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const userModel = require("../models/user.models");
const jwt = require('jsonwebtoken')
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  process.env.JWT_SECRET = "test_secret_key";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /auth/me", () => {
  let cookie;

  beforeEach(async () => {
    // Register a new user
    await request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        fullname: { firstname: "Test", lastname: "User" },
      });

    // Login to get the token cookie
    const res = await request(app)
      .post("/auth/login")
      .send({
        username: "testuser",
        password: "Password123",
      });

    cookie = res.headers["set-cookie"];
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access denied. No token provided");
  });

  it("should return 200 and user data if token is valid", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("username", "testuser");
    expect(res.body.message).toBe("user fetched succesfully");
  });
});
