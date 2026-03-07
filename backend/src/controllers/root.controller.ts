import { FastifyRequest, FastifyReply } from "fastify";
import UrlGenerator from "../services/url-generator.service";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq, sql } from "drizzle-orm";

type GeneratePromptBody = {
  prompt: string;
  userId?: string;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

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
    const { prompt, userId } = req.body as GeneratePromptBody;
    if(!prompt) throw new Error("Invalid or missing prompt");

    const safeUserAgent = req.headers["user-agent"] ?? "unknown";
    const safeUserId = typeof userId === "string" && isUuid(userId) ? userId : undefined;
    let resolvedUserId = safeUserId;

    if (resolvedUserId) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, resolvedUserId))
        .limit(1);

      if (existingUser.length > 0) {
        await db
          .update(users)
          .set({
            ip: req.ip,
            userAgent: safeUserAgent,
            promptHistory: sql`array_append(coalesce(${users.promptHistory}, '{}'::text[]), ${prompt})`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, resolvedUserId));
      } else {
        const [createdUser] = await db
          .insert(users)
          .values({
            id: resolvedUserId,
            ip: req.ip,
            userAgent: safeUserAgent,
            promptHistory: [prompt],
          })
          .returning({ id: users.id });

        resolvedUserId = createdUser.id;
      }
    } else {
      const [createdUser] = await db
        .insert(users)
        .values({
          ip: req.ip,
          userAgent: safeUserAgent,
          promptHistory: [prompt],
        })
        .returning({ id: users.id });

      resolvedUserId = createdUser.id;
    }

    const urls = UrlGenerator(prompt);
    
    return res.status(200).send({
      userId: resolvedUserId,
      data: urls
    });
  }
  catch (e) {
    console.error("Error in generating prompt", e);
    return null;
  }
}
