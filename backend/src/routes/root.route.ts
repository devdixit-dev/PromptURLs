import { FastifyInstance } from "fastify";
import { checkRoot, generatePrompts, requestModel } from "../controllers/root.controller";

const rootRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', checkRoot)
  fastify.post('/generate', generatePrompts);
  fastify.post('/request', requestModel);
}

export default rootRoutes;