import Fastify from 'fastify';

const buildApp = () => {
  const app = Fastify({
    logger: process.env.NODE_ENV === "production" ? { level: "info" } : true,
    trustProxy: true,
    bodyLimit: 1_048_576,
  });
  return app;
}

export default buildApp;
