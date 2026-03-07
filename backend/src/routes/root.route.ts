import { FastifyInstance } from "fastify";
import { checkRoot, generatePrompts } from "../controllers/root.controller";

const rootRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', checkRoot)
  fastify.post('/generate', generatePrompts);
}

export default rootRoutes;