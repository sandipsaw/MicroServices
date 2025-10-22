// Use an in-memory fake Redis when running tests to avoid connecting to production
if (process.env.NODE_ENV === 'test') {
    class FakeRedis {
        constructor() {
            this.store = new Map();
            this.expires = new Map();
        }
        async set(key, value, ...args) {
            // Support optional EX ttl
            if (args && args.length >= 2) {
                const exIndex = args.findIndex(a => String(a).toUpperCase() === 'EX');
                if (exIndex !== -1 && args[ exIndex + 1 ] != null) {
                    const seconds = Number(args[ exIndex + 1 ]);
                    const expireAt = Date.now() + seconds * 1000;
                    this.expires.set(key, expireAt);
                } else {
                    this.expires.delete(key);
                }
            } else {
                this.expires.delete(key);
            }
            this.store.set(key, value);
            return 'OK';
        }
        async get(key) {
            const exp = this.expires.get(key);
            if (exp && Date.now() > exp) {
                this.store.delete(key);
                this.expires.delete(key);
                return null;
            }
            return this.store.has(key) ? this.store.get(key) : null;
        }
        async del(key) {
            const existed = this.store.has(key) ? 1 : 0;
            this.store.delete(key);
            this.expires.delete(key);
            return existed;
        }
        on() { /* no-op in tests */ }
        quit() { return Promise.resolve(); }
    }
    module.exports = new FakeRedis();
} else {
    const { Redis } = require('ioredis');
    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
    });

    module.exports = redis;
}