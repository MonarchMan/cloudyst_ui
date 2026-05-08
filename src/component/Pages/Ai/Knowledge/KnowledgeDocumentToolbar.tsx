import { Button, Chip, FormControl, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { DocumentProgress } from "../../../../api/ai.ts";

export type DocumentFilterValue = "all" | DocumentProgress;
export type DocumentSortValue = "updated_desc" | "updated_asc";

interface KnowledgeDocumentToolbarProps {
  filter: DocumentFilterValue;
  search: string;
  sort: DocumentSortValue;
  visibleCount: number;
  selectedCount: number;
  canRetryFailed: boolean;
  onFilterChange: (event: SelectChangeEvent<string>) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (event: SelectChangeEvent<string>) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchReindexFailed: () => void;
}

const KnowledgeDocumentToolbar = ({
  filter,
  search,
  sort,
  visibleCount,
  selectedCount,
  canRetryFailed,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onSelectAllVisible,
  onClearSelection,
  onBatchDelete,
  onBatchReindexFailed,
}: KnowledgeDocumentToolbarProps) => {
  const { t } = useTranslation("application");

  return (
    <Stack spacing={1.5} sx={{ mb: 1.5 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("ai.searchDocuments")}
          sx={{ minWidth: { xs: "100%", md: 260 } }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
          <Select value={filter} onChange={onFilterChange}>
            <MenuItem value="all">{t("ai.filterAllDocuments")}</MenuItem>
            <MenuItem value={DocumentProgress.Success}>{t("ai.documentProgressSuccess")}</MenuItem>
            <MenuItem value={DocumentProgress.Processing}>{t("ai.documentProgressProcessing")}</MenuItem>
            <MenuItem value={DocumentProgress.Pending}>{t("ai.documentProgressPending")}</MenuItem>
            <MenuItem value={DocumentProgress.Failed}>{t("ai.documentProgressFailed")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
          <Select value={sort} onChange={onSortChange}>
            <MenuItem value="updated_desc">{t("ai.sortByUpdatedDesc")}</MenuItem>
            <MenuItem value="updated_asc">{t("ai.sortByUpdatedAsc")}</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip size="small" label={t("ai.visibleDocumentsCount", { count: visibleCount })} />
          <Chip size="small" variant="outlined" label={t("ai.selectedDocumentsCount", { count: selectedCount })} />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" onClick={onSelectAllVisible} disabled={visibleCount === 0}>
          {t("ai.selectVisible")}
        </Button>
        <Button size="small" variant="outlined" onClick={onClearSelection} disabled={selectedCount === 0}>
          {t("ai.clearSelection")}
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={onBatchDelete} disabled={selectedCount === 0}>
          {t("ai.batchDeleteDocuments")}
        </Button>
        <Button size="small" variant="outlined" onClick={onBatchReindexFailed} disabled={!canRetryFailed}>
          {t("ai.retryFailedDocuments")}
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {t("ai.knowledgePanelHint")}
      </Typography>
    </Stack>
  );
};

export default KnowledgeDocumentToolbar;
