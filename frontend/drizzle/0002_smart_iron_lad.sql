CREATE TYPE "public"."urgency_status" AS ENUM('normal', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "model_requets" (
	"request_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"model_name" text NOT NULL,
	"provider" text NOT NULL,
	"urgency" "urgency_status" DEFAULT 'normal',
	"details" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
