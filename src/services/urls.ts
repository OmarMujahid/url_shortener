import httpError from "http-errors";
import knex from "../config/knex";
import { validateCreateShortUrl, validateUpdateShortUrl } from "./validation";
import { register } from "validatorjs";
import { registerVisit } from "./visits";

export const createShortUrl = async (
  body: { url: string; id?: string },
  user_id: number
) => {
  validateCreateShortUrl(body);
  if (body.id) {
    const current_record = await knex("urls").where({ id: body.id }).first();
    if (current_record) {
      throw new httpError.Conflict("Id already exists");
    }
  }
  const results = await knex("urls").insert({url: body.url,id: body.id,user_id,},
    "*"
);
  return results[0];
};



export const resolveURL = async (id: string, ip: string) => {
  const url = await knex("urls").where({ id }).select(["url"]).first();
  if (!url) {
    throw new httpError.NotFound("not valid id");
  }
  await registerVisit(id, ip);
  return url.url;
};

export const updateUrl = async (
  id: string,
  body: { url: string },
  user_id: number
) => {
  validateUpdateShortUrl(body);
  const url = await knex("urls").where({ id }).select(["user_id"]).first();
  if (!url) {
    throw new httpError.Conflict("Url not found");
  }
  if (url.user_id !== user_id) {
    throw new httpError.Unauthorized("no permission");
  }
  const results = await knex("urls")
    .where({ id })
    .update({ url: body.url }, "*");
};

export const deleteUrl = async (id: string, user_id: number) => {
  const url = await knex("urls").where({ id }).select(["user_id"]).first();
  if (!url) {
    throw new httpError.Conflict("Url not found");
  }
  if (url.user_id !== user_id) {
    throw new httpError.Unauthorized("no permission");
  }

  await knex("urls").where({ id }).delete();
  return true;
};

export const getUrls = async (
  user_id: number,
  limit: number,
  offset: number
) => {
  //in case too much results we add limit and offset
  //getUrls(10,15,15) gets him the second 15 results etc
  const results = await knex("urls")
    .where({ user_id })
    .leftJoin("visits", "urls.id", "visits.url_id")
    .select([
      "urls.id",
      "urls.url",
      "urls.created_at",
      knex.raw("count(visits.id) as visits_count"),
    ])
    .limit(limit || 15)
    .offset(offset || 0)
    .groupBy("urls.id")
    .orderBy("urls.created_at","desc");
  return results;
};
