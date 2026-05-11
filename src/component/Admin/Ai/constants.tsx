import Bot from "../../Icons/Bot.tsx";
import { Status } from "../../../api/dashboard.ts";

export const ADMIN_AI_BASE_PATH = "/admin/ai";

export const AdminAiNavigationItem = {
  label: "dashboard:nav.ai",
  icon: [Bot, Bot],
  path: ADMIN_AI_BASE_PATH,
  children: [
    {
      label: "dashboard:nav.models",
      path: `${ADMIN_AI_BASE_PATH}/model`,
      level: 1,
    },
    {
      label: "dashboard:nav.apikeys",
      path: `${ADMIN_AI_BASE_PATH}/api-key`,
      level: 1,
    },
    {
      label: "dashboard:nav.knowledges",
      path: `${ADMIN_AI_BASE_PATH}/knowledge`,
      level: 1,
    },
    {
      label: "dashboard:nav.documents",
      path: `${ADMIN_AI_BASE_PATH}/document`,
      level: 1,
    },
    {
      label: "dashboard:nav.segments",
      path: `${ADMIN_AI_BASE_PATH}/segment`,
      level: 1,
    },
    {
      label: "dashboard:nav.roles",
      path: `${ADMIN_AI_BASE_PATH}/role`,
      level: 1,
    },
    {
      label: "dashboard:nav.conversations",
      path: `${ADMIN_AI_BASE_PATH}/conversation`,
      level: 1,
    },
    {
      label: "dashboard:nav.messages",
      path: `${ADMIN_AI_BASE_PATH}/message`,
      level: 1,
    },
    {
      label: "dashboard:nav.images",
      path: `${ADMIN_AI_BASE_PATH}/image`,
      level: 1,
    },
    {
      label: "dashboard:nav.tools",
      path: `${ADMIN_AI_BASE_PATH}/tool`,
      level: 1,
    },
  ],
};

export const AdminAiQuery = {
  common: {
    name: "name",
    model: "model",
    platform: "platform",
    status: "status",
    type: "type",
    userId: "user_id",
    modelId: "model_id",
    roleId: "role_id",
    knowledgeId: "knowledge_id",
    documentId: "document_id",
  },
  knowledge: {
    isPublic: "is_public",
    isMaster: "is_master",
  },
  conversation: {
    title: "title",
    pinned: "pinned",
  },
  message: {
    conversationId: "conversation_id",
  },
  role: {
    publicStatus: "public_status",
    category: "category",
  },
} as const;

export const AiTableColumnWidth = {
  checkbox: 44,
  id: 72,
  action: 88,
  status: 96,
  compact: 88,
  shortText: 120,
  mediumText: 160,
  longText: 220,
  extraLongText: 280,
} as const;

export const AI_API_KEY_PLATFORMS = ["openai", "qwen", "deepseek", "ark", "qianfan", "ollama", "gemini", "claude"] as const;

export const AI_MODEL_TYPES = ["chat", "draw", "music", "audio", "video"] as const;

export type AiStatusFilterValue = "" | Status;

export const parseAiStatusFilter = (value: string): AiStatusFilterValue => {
  if (value === Status.active || value === Status.inactive) {
    return value;
  }

  return "";
};

export const buildConditions = (conditions: Record<string, string | number | boolean | null | undefined>) =>
  Object.fromEntries(
    Object.entries(conditions)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)]),
  );
