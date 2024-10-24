/**
 * Controller and service that is in charge of managing the settings for the platform games like the ai weekly report
 * Settings right now just include the prompt for the ai weekly report and the test weekly scores to use when generating the performance review
 * The settings are stored in redis
 */

import { redisClient } from "../redis.ts";
import { Router, type RouterContext } from "@oak/oak/router";
import { gameMakerApiKeyMiddleware } from "../middleware/auth.ts";

export const getGameSettings = async (game: string) => {
  const key = `game-settings:${game}`;
  const settings = await redisClient.get(key);
  return settings;
};

export const setGameSettings = async (game: string, settings: string) => {
  const key = `game-settings:${game}`;
  await redisClient.set(key, settings);
};


const router = new Router();

router.get("/game-settings/:game", gameMakerApiKeyMiddleware, async (ctx: RouterContext<"/game-settings/:game">) => {
  const game = ctx.params.game;
  const settings = await getGameSettings(game);
  ctx.response.body ={data: settings};
  // ctx.response.body = { message: "Game settings retrieved" };
});

router.post("/game-settings/:game", gameMakerApiKeyMiddleware, async (ctx: RouterContext<"/game-settings/:game">) => {
  const game = ctx.params.game;
  const settings = await ctx.request.body.json();
  await setGameSettings(game, JSON.stringify(settings));
  ctx.response.body = { message: "Game settings updated" };
});

export const gameMakerRouter = router;