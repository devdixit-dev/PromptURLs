import { FastifyInstance } from "fastify";
import { generatePrompts, getRoot } from "../controllers/root.controller";

const rootRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', getRoot);
  fastify.post('/generate', generatePrompts);
}

export default rootRoutes;