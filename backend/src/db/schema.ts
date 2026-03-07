import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull()
}

export const users = pgTable("users", {
  id: uuid("user_id").defaultRandom().primaryKey(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent").notNull(),
  promptHistory: text("prompt_history").array().default([]),
  ...timestamps
});

export const urgencyStatus = pgEnum("urgency_status", ["normal", "high", "critical"]);

export const modelRequests = pgTable("model_requets", {
  id: uuid("request_id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  modelName: text("model_name").notNull(),
  provider: text("provider").notNull(),
  urgency: urgencyStatus().default("normal"),
  details: text("details").notNull(),
  ...timestamps
});