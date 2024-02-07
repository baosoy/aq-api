import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import postgres from "postgres";

const pg = postgres(process.env.POSTGRES_CONNECTION_STRING);

const app = new Hono();
app.use("*", logger());
app.use("*", cors("*"));

app.get("/health", async (c) => {
  return c.json({ ok: true }, 200);
});

app
  .use(
    basicAuth({
      username: process.env.BASIC_USERNAME,
      password: process.env.BASIC_PASSWORD,
    })
  )
  .post("/readings", async (c) => {
    const { readings, ...rest } = await c.req.json();
    console.log(readings, rest);
    const [data] = await pg`insert into aq_readings ${pg({
      timestamp: rest.timestamp,
      uid: rest.uid,
      nickname: rest.nickname,
      model: rest.model,
      temperature: readings.temperature,
      humidity: readings.humidity,
      pressure: readings.pressure,
      noise: readings.noise,
      pm1: readings.pm1,
      pm2_5: readings.pm2_5,
      pm10: readings.pm10,
    })} returning *`;

    return c.json(data, 201);
  });

app.get("/readings/sequencer", async (c) => {
  const [data] =
    await pg`select * from aq_readings where nickname = 'aq-game' ORDER BY timestamp DESC LIMIT 1`;

  return c.json(data, 200);
});

export default app;
serve({ fetch: app.fetch, port: process.env.PORT }, (info) => {
  console.log(`Listening on http://${info.address}:${info.port}`);
});
