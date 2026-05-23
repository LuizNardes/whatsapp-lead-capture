export interface ZApiWebhookPayload {
  phone: string;
  messageId: string;
  fromMe: boolean;
  momment: number;
  status: string;
  chatName: string;
  senderName: string;
  type: string;
  text?: { message: string };
  image?: { caption?: string; imageUrl?: string };
  audio?: { audioUrl?: string };
  document?: { fileName?: string };
  instanceId: string;
}

export interface Lead {
  name: string;
  phone: string;
  message: string;
  receivedAt: string;
}
