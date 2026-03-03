import Fastify from 'fastify';

const buildApp = () => {
  const app = Fastify({ logger: true });
  return app;
}

export default buildApp;