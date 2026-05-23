import type { ZApiWebhookPayload, Lead } from "../types";

const seenPhones = new Set<string>();

function extractText(payload: ZApiWebhookPayload): string {
  return (
    payload.text?.message ??
    payload.image?.caption ??
    payload.document?.fileName ??
    "(mídia sem texto)"
  );
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export function parseLead(payload: ZApiWebhookPayload): Lead | null {
  if (payload.fromMe) return null;
  if (payload.type !== "ReceivedCallback") return null;

  const phone = payload.phone;

  if (seenPhones.has(phone)) return null;
  seenPhones.add(phone);

  return {
    name: payload.senderName || payload.chatName || phone,
    phone,
    message: extractText(payload),
    receivedAt: formatTimestamp(payload.momment),
  };
}
