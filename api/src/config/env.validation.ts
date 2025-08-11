import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"]) 
    .optional()
    .default("development"),
  PORT: z.string().regex(/^\d+$/).optional(),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().optional(),
  CHAT_MAX_STEPS: z.string().regex(/^\d+$/).optional(),
  OPENAI_STORE: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return config;
}

