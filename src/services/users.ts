import { validateLogin, validateRegister } from "./validation";

import knex from "../config/knex";
import httpError from "http-errors";
import { comparePassword, hashPassword } from "../config/encryption";
import { generateToken } from "../config/jwt";

const getUser = async (username: string) => {
  return await knex("users")
    .whereRaw("LOWER(username) = LOWER(?)", [username])
    .first();
};

export const register = async (body: {username: string; password: string;}) => {
  validateRegister(body);
  //lowercase = uppercase in usernames here
  const current_user = await getUser(body.username);
  if (current_user) {
    throw new httpError.Conflict("Username Exists");
  }
  const user = (
    await knex("users").insert(
      {
        username: body.username.toLocaleLowerCase(),
        password: await hashPassword(body.password),
      },
      ["id", "username"]
    )
  )[0];
  return user;
};


export const login = async (body: { username: string; password: string }) => {
  validateLogin(body);
  const user = await getUser(body.username);
  if (!user) {
    throw new httpError.Unauthorized("incorrect");
  }
  const passwordMatch = await comparePassword(body.password, user.password);
  if (!passwordMatch) {
    throw new httpError.Unauthorized("password");
    
  }
  const token = await generateToken({ id: user.id });
  return {
    user: {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
  };
};
