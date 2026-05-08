import { Box, Paper, Tab, Tabs } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ChatTab from "./ChatTab.tsx";
import KnowledgeTab from "./KnowledgeTab.tsx";

enum AiTab {
  chat = "chat",
  knowledge = "knowledge",
}

const AiPage = () => {
  const { t } = useTranslation("application");
  const [activeTab, setActiveTab] = useState<AiTab>(AiTab.chat);
  const [draftKnowledgeId, setDraftKnowledgeId] = useState<string | null>(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider", borderRadius: 0 }}>
        <Tabs value={activeTab} onChange={(_e, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab value={AiTab.chat} label={t("ai.chat")} />
          <Tab value={AiTab.knowledge} label={t("ai.knowledge")} />
        </Tabs>
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === AiTab.chat && (
          <ChatTab draftKnowledgeId={draftKnowledgeId} onDraftKnowledgeApplied={() => setDraftKnowledgeId(null)} />
        )}
        {activeTab === AiTab.knowledge && (
          <KnowledgeTab
            onStartRagChat={(knowledgeId) => {
              setDraftKnowledgeId(knowledgeId);
              setActiveTab(AiTab.chat);
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AiPage;
