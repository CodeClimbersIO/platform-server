import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { oakCors } from "@denoland/cors";
import { assert } from "jsr:@std/assert@1/assert";
import { gameMakerRouter } from "./routes/gameMakerRoutes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { weeklyReportRouter } from "./routes/weeklyReportRoutes.ts";
import { isDevelopment } from "./environment.ts";


const app = new Application();

app.use(oakCors({
  origin: isDevelopment ? "*" : "https://codeclimbers.com"
}));

app.use(async (ctx, next) => {
  ctx.response.type = "application/json";
  await next();
});

const router = new Router();

router.get('/health', (ctx) => {
  ctx.response.body = {ok: true};
})

app.use(router.routes());
app.use(weeklyReportRouter.routes());
app.use(gameMakerRouter.routes());
app.use(router.allowedMethods());

app.use(errorHandler);

const PORT = Deno.env.get("PORT") || 8000;
assert(typeof PORT === "number", "PORT must be a number");

app.listen({ port: PORT });
