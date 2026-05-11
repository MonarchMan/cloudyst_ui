import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography, alpha, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

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

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success" | "info" | "error" | "warning";
}

const StatTile = ({ label, value, tone = "default" }: StatTileProps) => {
  const theme = useTheme();
  const colorMap = {
    default: theme.palette.text.primary,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
  };
  const color = colorMap[tone];

  return (
    <Box
      sx={{
        minWidth: 128,
        flex: "1 1 128px",
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.14 : 0.08),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
};

const stripLeadingZero = (label: string) => label.replace(/^0\s*/, "").trim();

const KnowledgeOverview = ({ stats, onImport, onCancelTasks, onResumeTasks }: KnowledgeOverviewProps) => {
  const { t } = useTranslation("application");
  const theme = useTheme();
  const documentLabel = stripLeadingZero(t("ai.indexedDocumentCount", { count: 0 }));
  const knowledgeLabel = stripLeadingZero(t("ai.knowledgeCount", { count: 0 }));
  const successRateLabel = t("ai.successRate", { value: "" }).replace("%", "").trim();
  const tokensLabel = stripLeadingZero(t("ai.totalTokensCount", { count: 0 }));
  const chartTotal = stats.readyCount + stats.processingCount + stats.failedCount;
  const chartData =
    chartTotal > 0
      ? [
          {
            key: "ready",
            name: t("ai.indexedDocumentCount", { count: stats.readyCount }),
            value: stats.readyCount,
            color: theme.palette.success.main,
          },
          {
            key: "processing",
            name: t("ai.processingDocumentCount", { count: stats.processingCount }),
            value: stats.processingCount,
            color: theme.palette.info.main,
          },
          {
            key: "failed",
            name: t("ai.failedDocumentCount", { count: stats.failedCount }),
            value: stats.failedCount,
            color: theme.palette.error.main,
          },
        ].filter((item) => item.value > 0)
      : [
          {
            key: "empty",
            name: t("ai.indexedDocumentCount", { count: 0 }),
            value: 1,
            color: theme.palette.action.disabledBackground,
          },
        ];

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.035),
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "flex-start" }}>
            <Box sx={{ maxWidth: 620 }}>
              <Typography variant="overline" color="primary" fontWeight={700}>
                {t("ai.knowledge")}
              </Typography>
              <Typography variant="h5" fontWeight={750}>
                {t("ai.ragTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                {t("ai.ragDescription")}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: "flex-start", md: "flex-end" }}>
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

          <Divider />

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} alignItems="stretch">
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ flex: 1, minWidth: 0 }}>
              <StatTile label={knowledgeLabel} value={stats.knowledgeCount} />
              <StatTile label={documentLabel} value={stats.documentCount} />
              <StatTile label={successRateLabel} value={`${stats.successRate}%`} tone="success" />
              <StatTile label={tokensLabel} value={stats.totalTokens.toLocaleString()} tone="warning" />
            </Stack>

            <Box
              sx={{
                width: { xs: "100%", lg: 360 },
                minHeight: 190,
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ height: "100%" }}>
                <Box sx={{ width: 150, height: 150, position: "relative", flex: "0 0 auto" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" innerRadius={45} outerRadius={68} paddingAngle={chartTotal > 0 ? 3 : 0} stroke="none">
                        {chartData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Typography variant="h6" fontWeight={800}>
                      {stats.documentCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {documentLabel}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                  {chartData.map((item) => (
                    <Stack key={item.key} direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color, flex: "0 0 auto" }} />
                      <Typography variant="body2" noWrap title={item.name}>
                        {item.name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KnowledgeOverview;
