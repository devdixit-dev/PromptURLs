import { FastifyRequest, FastifyReply } from "fastify";
import UrlGenerator from "../services/url-generator.service";

export const generatePrompts = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { prompt } = req.body as { prompt: string };
    if(!prompt) throw new Error("Invalid or missing prompt");

    const urls = UrlGenerator(prompt);
    return urls;
  }
  catch (e) {
    console.error("Error in generating prompt", e);
    return null;
  }
}