import Router from "@koa/router";
import {
  createShortUrl,
  deleteUrl,
  getUrls,
  updateUrl,
} from "../services/urls";

const urlRouter = new Router();

urlRouter
  .get("/", async (ctx) => {
    ctx.response.body = await getUrls(
      ctx.state.user_id,
      Number(ctx.request.query.limit),
      Number(ctx.request.query.offset)
    );
  })
  .post("/", async (ctx) => {
    ctx.response.body = await createShortUrl(
      ctx.request.body as any,
      ctx.state.user_id
    );
  })
  .put("/", async (ctx) => {
    ctx.response.body = await updateUrl(
      ctx.params.id,
      ctx.request.body as any,
      ctx.state.user_id
    );
  })
  .delete("/", async (ctx) => {
    ctx.response.body = await deleteUrl(ctx.params.id, ctx.state.user_id);
  });


  
export default urlRouter;

