import 'dotenv/config';
import buildApp from "./app";
import { pool } from './db/client';
import { FastifyReply, FastifyRequest } from 'fastify';

import rootRoutes from './routes/root.route';
import adminRoute from './routes/admin.route';

const start = async () => {
  const app = buildApp();
  try {
    app.get("/", (_: FastifyRequest, res: FastifyReply) => {
      return res.status(200).send({
        status: "Okay",
        uptime: process.uptime()
      });
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