const { Redis } = require('ioredis')

const isTest = process.env.NODE_ENV === 'test';
const redis = isTest
    ? new Redis({
        host: process.env.REDIS_TEST_HOST || '127.0.0.1',
        port: process.env.REDIS_TEST_PORT || 6379,
        db: process.env.REDIS_TEST_DB || 1, // use a different DB index for tests
        password: process.env.REDIS_TEST_PASSWORD || undefined,
    })
    : new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    });

redis.on("connect", () => {
    console.log("connected to Redis");
})
module.exports = redis