import { FastifyInstance } from "fastify";

const adminRoute = (fastify: FastifyInstance) => {
  fastify.get('/all', () => {})
}

export default adminRoute;