import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { GetDocumentResponse } from "../../../../api/ai.ts";
import { CrUriPrefix } from "../../../../util/uri.ts";
import Delete from "../../../Icons/Delete.tsx";
import ArrowSync from "../../../Icons/ArrowSync.tsx";
import { DocumentProgress } from "../../../../api/dashboard.ts";

interface KnowledgeDocumentListProps {
  loading: boolean;
  documents: GetDocumentResponse[];
  page: number;
  pageSize: number;
  total: number;
  selectedIds: string[];
  documentFailures: Record<string, string>;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: string) => void;
  onDelete: (document: GetDocumentResponse) => void;
  onReindex: (document: GetDocumentResponse) => void;
}

const getFilesystemPath = (url: string) => {
  if (!url.startsWith(CrUriPrefix)) {
    return null;
  }

  return url.replace(CrUriPrefix, "");
};

const KnowledgeDocumentList = ({
  loading,
  documents,
  page,
  pageSize,
  total,
  selectedIds,
  documentFailures,
  onPageChange,
  onToggleSelect,
  onDelete,
  onReindex,
}: KnowledgeDocumentListProps) => {
  const { t } = useTranslation("application");

  const renderProgressChip = (progress: DocumentProgress) => {
    const progressMap: Record<DocumentProgress, { color: "default" | "info" | "success" | "error"; label: string }> = {
      [DocumentProgress.Pending]: {
        color: "default",
        label: t("ai.documentProgressPending"),
      },
      [DocumentProgress.Processing]: {
        color: "info",
        label: t("ai.documentProgressProcessing"),
      },
      [DocumentProgress.Success]: {
        color: "success",
        label: t("ai.documentProgressSuccess"),
      },
      [DocumentProgress.Failed]: {
        color: "error",
        label: t("ai.documentProgressFailed"),
      },
    };
    const target = progressMap[progress];
    return <Chip size="small" color={target.color} variant="outlined" label={target.label} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("ai.noFilesystemDocuments")}
        </Typography>
      </Box>
    );
  }

  return (
    <List dense sx={{ py: 0 }}>
      {documents.map((doc) => {
        const isSelected = selectedIds.includes(doc.id);
        const sourcePath = getFilesystemPath(doc.url) ?? doc.url;
        const failureReason = documentFailures[doc.id];

        return (
          <ListItem
            key={doc.id}
            sx={{ px: 0, alignItems: "flex-start" }}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <Tooltip title={doc.progress === DocumentProgress.Failed ? t("ai.retryIndex") : t("ai.reindexDocument")}>
                  <IconButton edge="end" size="small" onClick={() => onReindex(doc)}>
                    <ArrowSync fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("ai.deleteDocument")}>
                  <IconButton edge="end" size="small" color="error" onClick={() => onDelete(doc)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <Checkbox edge="start" checked={isSelected} onChange={() => onToggleSelect(doc.id)} sx={{ pt: 0.5, mr: 0.5 }} />
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                  <Typography variant="body2" fontWeight={500}>
                    {doc.name}
                  </Typography>
                  {renderProgressChip(doc.progress)}
                  {failureReason && (
                    <Tooltip title={failureReason}>
                      <Chip size="small" color="error" variant="filled" label={t("ai.documentFailureReason")} />
                    </Tooltip>
                  )}
                </Stack>
              }
              secondary={
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {sourcePath}
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Typography variant="caption" color="text.secondary">
                      {t("ai.documentVersion", { value: doc.version || "-" })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("ai.segmentMaxTokens", { value: doc.segment_max_tokens })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("ai.documentUpdatedAt", { value: dayjs(doc.updated_at).format("YYYY-MM-DD HH:mm") })}
                    </Typography>
                    {doc.progress === DocumentProgress.Success && (
                      <Typography variant="caption" color="text.secondary">
                        {t("ai.documentTokens", { count: doc.tokens ?? 0 })}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              }
            />
          </ListItem>
        );
      })}
      {total > pageSize && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
          <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(_event, value) => onPageChange(value)} />
        </Box>
      )}
    </List>
  );
};

export default KnowledgeDocumentList;
