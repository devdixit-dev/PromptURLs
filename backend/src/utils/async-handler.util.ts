import { FastifyReply, FastifyRequest } from "fastify";

const asyncHandler = async (fn: Function) => {
  return async function (req: FastifyRequest, res: FastifyReply, next: Function) {
    try {
      const result = await fn(req, res, next);
      return result;
    }
    catch (error) {
      return res.status(500).send({
        error: 'Internal server error'
      });
    }
  }
}

export default asyncHandler;

// how to implement this function
/*

app.get("/", asyncHandler(async(req, res) => {
  return res.json({ message: "hello" });
}));

*/