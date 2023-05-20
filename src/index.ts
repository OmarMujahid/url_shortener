import "dotenv/config";
import knex, { onDatabaseConnect } from "./config/knex";
import { login } from "./services/users";
import { generateToken, validateJWT } from "./config/jwt";
import Koa from "koa";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import { createShortUrl } from "./services/urls";
import router from "./routes/index";

const app = new Koa();

app.use(cors());
app.use(helmet());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const main = async () => {
  try {
    await onDatabaseConnect();
    console.log("Database is connected");
    app.listen(3000, () => {
      console.log("Server started at 3000");
    });
  } catch (error) {
    console.log(error);
  }
};

main();


// const user = await register({username:"Test", password:"123456"});
// const user = await login({username:"Test", password:"123456"});
// console.log(validateJWT(user.token));
