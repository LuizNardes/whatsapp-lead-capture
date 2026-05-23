import express from "express";
import { env } from "./config/env";
import { zapiRouter } from "./webhooks/zapi";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(zapiRouter);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`Webhook endpoint: POST /webhook/zapi`);
});
