import Router from "@koa/router";
import { getVisitsByUrl, lastVisit } from "../services/visits";

const visitsRouter = new Router();

visitsRouter
  .get("/", async (ctx) => {
    ctx.response.body = await lastVisit(
      ctx.state.user_id,
      Number(ctx.query.limit),
      Number(ctx.query.offset)
    );
    console.log(ctx.response.body);
    
  })
  .get("/:id", async (ctx) => {
    ctx.response.body = await getVisitsByUrl(
      ctx.params.id,
      ctx.state.user_id,
      Number(ctx.query.limit),
      Number(ctx.query.offset)
    );
  });

export default visitsRouter;
