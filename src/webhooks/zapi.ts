import { Router, type Request, type Response } from "express";
import { env } from "../config/env";
import { parseLead } from "../services/lead";
import { appendLead } from "../services/sheets";
import type { ZApiWebhookPayload } from "../types";

export const zapiRouter = Router();

zapiRouter.post("/webhook/zapi", async (req: Request, res: Response) => {
  // Z-API envia o security token no header Client-Token
  if (env.webhookSecurityToken) {
    const token = req.headers["client-token"];
    if (token !== env.webhookSecurityToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const payload = req.body as ZApiWebhookPayload;

  const lead = parseLead(payload);

  if (!lead) {
    res.json({ ignored: true });
    return;
  }

  try {
    await appendLead(lead);
    console.log(`[lead] ${lead.phone} — ${lead.name}`);
    res.json({ ok: true, lead });
  } catch (err) {
    console.error("[sheets] Failed to append lead:", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
});
