import { FastifyInstance } from "fastify";
import { generatePrompts } from "../controllers/root.controller";

const rootRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/generate', generatePrompts);
}

export default rootRoutes;