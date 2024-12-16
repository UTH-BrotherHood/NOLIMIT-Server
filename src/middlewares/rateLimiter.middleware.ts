import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

const redisClient = createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

redisClient.connect().catch(console.error);

redisClient.on("error", (err) => {
    console.error("Redis error: ", err);
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware', // Tiền tố cho key trong Redis để phân biệt các trường hợp sử dụng rate limiting khác nhau.
    points: 10,
    duration: 60,
    blockDuration: 30,
});

const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

    rateLimiter.consume(ip)
        .then(() => {
            console.log(`IP: ${ip} - Request allowed`);
            next();
        })
        .catch(() => {
            console.log(`IP: ${ip} - Request blocked`);
            res.status(429).send('Too many requests. Please try again later.');
        });
};

export default rateLimiterMiddleware;