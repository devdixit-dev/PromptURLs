import { FastifyRequest, FastifyReply } from "fastify";
import UrlGenerator from "../services/url-generator.service";

export const checkRoot = async (_: FastifyRequest, res: FastifyReply) => {
  try{
    return res.send({
      route: 'Root',
      status: 'Okay'
    });
  }
  catch(e) {
    console.error("Error in checking root route", e);
    return null
  }
}

export const generatePrompts = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { prompt } = req.body as { prompt: string };
    if(!prompt) throw new Error("Invalid or missing prompt");

    const urls = UrlGenerator(prompt);
    
    return res.status(200).send({
      data: urls
    });
  }
  catch (e) {
    console.error("Error in generating prompt", e);
    return null;
  }
}