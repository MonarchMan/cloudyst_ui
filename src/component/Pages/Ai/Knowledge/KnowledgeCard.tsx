import { Button, Card, CardContent, Chip, Collapse, Divider, Stack, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GetDocumentResponse, GetKnowledgeResponse, GetKnowledgeStatsResponse } from "../../../../api/ai.ts";
import Book from "../../../Icons/Book.tsx";
import ChevronRight from "../../../Icons/ChevronRight.tsx";
import Sparkle from "../../../Icons/Sparkle.tsx";
import KnowledgeDocumentList from "./KnowledgeDocumentList.tsx";
import KnowledgeDocumentToolbar, { DocumentFilterValue, DocumentSortValue } from "./KnowledgeDocumentToolbar.tsx";
import { DocumentProgress } from "../../../../api/dashboard.ts";

interface KnowledgeCardProps {
  knowledge: GetKnowledgeResponse;
  expanded: boolean;
  documents: GetDocumentResponse[];
  knowledgeStats?: GetKnowledgeStatsResponse;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filter: DocumentFilterValue;
  search: string;
  sort: DocumentSortValue;
  selectedIds: string[];
  activeTaskCount: number;
  activeTaskProgress?: number;
  resumableTaskCount: number;
  documentFailures: Record<string, string>;
  onToggle: () => void;
  onImport: () => void;
  onStartRagChat: () => void;
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: string) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchReindexFailed: () => void;
  onCancelTasks: () => void;
  onResumeTasks: () => void;
  onDelete: (document: GetDocumentResponse) => void;
  onReindex: (document: GetDocumentResponse) => void;
}

const KnowledgeCard = ({
  knowledge,
  expanded,
  documents,
  knowledgeStats,
  loading,
  page,
  pageSize,
  total,
  filter,
  search,
  sort,
  selectedIds,
  activeTaskCount,
  activeTaskProgress,
  resumableTaskCount,
  documentFailures,
  onToggle,
  onImport,
  onStartRagChat,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onPageChange,
  onToggleSelect,
  onSelectAllVisible,
  onClearSelection,
  onBatchDelete,
  onBatchReindexFailed,
  onCancelTasks,
  onResumeTasks,
  onDelete,
  onReindex,
}: KnowledgeCardProps) => {
  const { t } = useTranslation("application");

  const summary = useMemo(() => {
    const readyCount = knowledgeStats?.ready ?? documents.filter((doc) => doc.progress === DocumentProgress.Success).length;
    const processingCount =
      knowledgeStats?.processing ??
      documents.filter((doc) => doc.progress === DocumentProgress.Pending || doc.progress === DocumentProgress.Processing).length;
    const failedCount = knowledgeStats?.failed ?? documents.filter((doc) => doc.progress === DocumentProgress.Failed).length;
    const totalCount = knowledgeStats?.document_count ?? total;
    const successCount = knowledgeStats?.success ?? readyCount;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

    return {
      total: totalCount,
      readyCount,
      processingCount,
      failedCount,
      successRate,
    };
  }, [documents, knowledgeStats, total]);

  const canRetryFailed = selectedIds.some((id) =>
    documents.some((doc) => doc.id === id && doc.progress === DocumentProgress.Failed),
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ cursor: "pointer" }}
            onClick={onToggle}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Book sx={{ fontSize: 20, color: "primary.main" }} />
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {knowledge.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {knowledge.embedding_model} / top_k: {knowledge.top_k}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip size="small" label={t("ai.visibleDocumentsCount", { count: summary.total })} />
              <Chip size="small" color="success" variant="outlined" label={t("ai.readyDocumentCount", { count: summary.readyCount })} />
              <Chip size="small" color="info" variant="outlined" label={t("ai.processingDocumentCount", { count: summary.processingCount })} />
              <Chip size="small" color="error" variant="outlined" label={t("ai.failedDocumentCount", { count: summary.failedCount })} />
              <Chip size="small" variant="outlined" label={t("ai.successRate", { value: summary.successRate })} />
              {activeTaskCount > 0 && (
                <Chip
                  size="small"
                  color="info"
                  label={t("ai.activeIndexTasks", {
                    count: activeTaskCount,
                    progress: activeTaskProgress === undefined ? t("ai.taskProgressPending") : `${activeTaskProgress}%`,
                  })}
                />
              )}
              {knowledge.is_public && <Chip size="small" label={t("ai.public")} />}
              <Button
                size="small"
                variant="outlined"
                color="warning"
                disabled={activeTaskCount === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  onCancelTasks();
                }}
              >
                {t("ai.cancelIndexTasks")}
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={resumableTaskCount === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  onResumeTasks();
                }}
              >
                {t("ai.resumeIndexTasks", { count: resumableTaskCount })}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(event) => {
                  event.stopPropagation();
                  onImport();
                }}
              >
                {t("ai.importFiles")}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<Sparkle />}
                onClick={(event) => {
                  event.stopPropagation();
                  onStartRagChat();
                }}
              >
                {t("ai.startRagChat")}
              </Button>
              <ChevronRight
                sx={{
                  fontSize: 18,
                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  color: "text.secondary",
                }}
              />
            </Stack>
          </Stack>

          <Collapse in={expanded}>
            <Divider sx={{ mb: 1.5 }} />
            {knowledge.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {knowledge.description}
              </Typography>
            )}

            <KnowledgeDocumentToolbar
              filter={filter}
              search={search}
              sort={sort}
              visibleCount={total}
              selectedCount={selectedIds.length}
              canRetryFailed={canRetryFailed}
              onFilterChange={(event) => onFilterChange(event.target.value)}
              onSearchChange={onSearchChange}
              onSortChange={(event) => onSortChange(event.target.value)}
              onSelectAllVisible={onSelectAllVisible}
              onClearSelection={onClearSelection}
              onBatchDelete={onBatchDelete}
              onBatchReindexFailed={onBatchReindexFailed}
            />

            <KnowledgeDocumentList
              loading={loading}
              documents={documents}
              page={page}
              pageSize={pageSize}
              total={total}
              selectedIds={selectedIds}
              documentFailures={documentFailures}
              onPageChange={onPageChange}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onReindex={onReindex}
            />
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KnowledgeCard;
