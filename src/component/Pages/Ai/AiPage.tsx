import { Box } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatTab from "./ChatTab.tsx";
import KnowledgeTab from "./KnowledgeTab.tsx";
import { AI_ASSISTANT_BASE_PATH } from "./constants.tsx";

enum AiTab {
  chat = "chat",
  knowledge = "knowledge",
}

const AiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [draftKnowledgeId, setDraftKnowledgeId] = useState<string | null>(null);
  const activeTab = location.pathname.startsWith(`${AI_ASSISTANT_BASE_PATH}/knowledge`) ? AiTab.knowledge : AiTab.chat;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {activeTab === AiTab.chat && (
          <ChatTab draftKnowledgeId={draftKnowledgeId} onDraftKnowledgeApplied={() => setDraftKnowledgeId(null)} />
        )}
        {activeTab === AiTab.knowledge && (
          <KnowledgeTab
            onStartRagChat={(knowledgeId) => {
              setDraftKnowledgeId(knowledgeId);
              navigate(`${AI_ASSISTANT_BASE_PATH}/chat`);
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AiPage;
