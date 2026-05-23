import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  webhookSecurityToken: process.env.ZAPI_SECURITY_TOKEN ?? "",

  zapi: {
    instanceId: required("ZAPI_INSTANCE_ID"),
    token: required("ZAPI_TOKEN"),
  },

  google: {
    sheetId: required("GOOGLE_SHEET_ID"),
    serviceAccountEmail: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    privateKey: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  },
};
