import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull()
}

export const users = pgTable("users", {
  id: uuid("user_id").defaultRandom().primaryKey(),
  ip: integer().default(0).notNull(),
  userAgent: text("user_agent").notNull(),
  ...timestamps
});

export const promptHistory = pgTable("prompt_history", {
  id: uuid("prompt_history_id").defaultRandom().primaryKey(),
  prompt: text("prompt").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull()
});