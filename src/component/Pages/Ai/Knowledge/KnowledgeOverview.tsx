import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export interface KnowledgeOverviewStats {
  knowledgeCount: number;
  documentCount: number;
  readyCount: number;
  processingCount: number;
  failedCount: number;
  successRate: number;
  totalTokens: number;
  activeTaskCount: number;
  activeTaskProgress?: number;
  resumableTaskCount: number;
}

interface KnowledgeOverviewProps {
  stats: KnowledgeOverviewStats;
  onImport: () => void;
  onCancelTasks: () => void;
  onResumeTasks: () => void;
}

const KnowledgeOverview = ({ stats, onImport, onCancelTasks, onResumeTasks }: KnowledgeOverviewProps) => {
  const { t } = useTranslation("application");

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {t("ai.ragTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("ai.ragDescription")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip label={t("ai.knowledgeCount", { count: stats.knowledgeCount })} />
            <Chip label={t("ai.indexedDocumentCount", { count: stats.documentCount })} variant="outlined" />
            <Chip label={t("ai.processingDocumentCount", { count: stats.processingCount })} color="info" variant="outlined" />
            <Chip label={t("ai.failedDocumentCount", { count: stats.failedCount })} color="error" variant="outlined" />
            <Chip label={t("ai.successRate", { value: stats.successRate })} color="success" variant="outlined" />
            <Chip label={t("ai.totalTokensCount", { count: stats.totalTokens })} variant="outlined" />
            {stats.activeTaskCount > 0 && (
              <Chip
                label={t("ai.activeIndexTasks", {
                  count: stats.activeTaskCount,
                  progress: stats.activeTaskProgress === undefined ? t("ai.taskProgressPending") : `${stats.activeTaskProgress}%`,
                })}
                color="info"
              />
            )}
            <Button variant="outlined" color="warning" onClick={onCancelTasks} disabled={stats.activeTaskCount === 0}>
              {t("ai.cancelIndexTasks")}
            </Button>
            <Button variant="outlined" onClick={onResumeTasks} disabled={stats.resumableTaskCount === 0}>
              {t("ai.resumeIndexTasks", { count: stats.resumableTaskCount })}
            </Button>
            <Button variant="contained" onClick={onImport}>
              {t("ai.importFiles")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KnowledgeOverview;
