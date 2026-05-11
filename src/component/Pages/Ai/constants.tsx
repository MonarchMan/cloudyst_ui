import Bot from "../../Icons/Bot.tsx";

export const AI_ASSISTANT_BASE_PATH = "/ai";

export const AiAssistantNavigationItem = {
  label: "navbar.ai",
  icon: [Bot, Bot],
  path: AI_ASSISTANT_BASE_PATH,
  children: [
    {
      label: "ai.chat",
      path: `${AI_ASSISTANT_BASE_PATH}/chat`,
      level: 1,
    },
    {
      label: "ai.knowledge",
      path: `${AI_ASSISTANT_BASE_PATH}/knowledge`,
      level: 1,
    },
  ],
};
