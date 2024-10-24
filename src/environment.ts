export const isProduction = Deno.env.get("DENO_ENV") === "production";
export const isDevelopment = Deno.env.get("DENO_ENV") === "development";
