import 'dotenv/config';
import buildApp from "./app";
import { pool } from './db/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import rootRoutes from './routes/root.route';
import adminRoute from './routes/admin.route';

const allowedOrigins = [process.env.DEV_URL, process.env.PRO_URL]
  .flatMap((value) => (value ? value.split(",") : []))
  .map((origin) => origin.trim())
  .filter(Boolean);

const start = async () => {
  const app = buildApp();
  try {
    app.get("/", (_: FastifyRequest, res: FastifyReply) => {
      return res.status(200).send({
        status: "Okay",
        uptime: process.uptime()
      });
    });

    // cors
    app.register(cors, {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        callback(null, allowedOrigins.includes(origin));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true
    });

    // rate-limit
    app.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      errorResponseBuilder(req, context) {
        return {
          statusCode: 429,
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${context.after}`
        }
      },
    });

    // helmet
    app.register(helmet, {
      crossOriginResourcePolicy: { policy: "cross-origin" },
    });

    app.register(rootRoutes, {prefix: "/api/root"});
    app.register(adminRoute, {prefix: "/api/admin"});

    await pool.connect()
      .then(() => { console.log('Database connected') })
      .catch((e) => { console.error('Database connection error', e) });

    await app.listen({
      port: Number(process.env.PORT),
      host: "0.0.0.0"
    });
  }
  catch (e) {
    app.log.error(e);
    process.exit(1);
  }
}

start();
