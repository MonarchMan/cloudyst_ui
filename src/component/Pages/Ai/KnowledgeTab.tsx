import { Box, CircularProgress, Pagination, SelectChangeEvent, Stack } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GetDocumentResponse,
  GetKnowledgeResponse,
  GetKnowledgeStatsResponse,
  ListDocumentsResponse,
} from "../../../api/ai.ts";
import {
  batchReindexDocuments,
  createMultiDocuments,
  deleteDocument,
  deleteMultiDocuments,
  getKnowledgeStats,
  listDocuments,
  listKnowledge,
  reindexDocument,
} from "../../../api/api.ts";
import { FileType, Metadata } from "../../../api/explorer.ts";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
import { clearSelected } from "../../../redux/fileManagerSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { FileManagerIndex } from "../../FileManager/FileManager.tsx";
import { CrUriPrefix } from "../../../util/uri.ts";
import { getFileLinkedUri } from "../../../util";
import KnowledgeCard from "./Knowledge/KnowledgeCard.tsx";
import KnowledgeImportDialog from "./Knowledge/KnowledgeImportDialog.tsx";
import KnowledgeOverview from "./Knowledge/KnowledgeOverview.tsx";
import { DocumentFilterValue, DocumentSortValue } from "./Knowledge/KnowledgeDocumentToolbar.tsx";
import { confirmOperation } from "../../../redux/thunks/dialog.ts";
import { useAiTaskTracker } from "./Knowledge/useAiTaskTracker.ts";
import { DocumentProgress } from "../../../api/dashboard.ts";

export interface KnowledgeTabProps {
  onStartRagChat?: (knowledgeId: string) => void;
}

const KnowledgeTab = ({ onStartRagChat }: KnowledgeTabProps) => {
  const { t } = useTranslation("application");
  const dispatch = useAppDispatch();
  const selectedImportFiles = useAppSelector((state) => Object.values(state.fileManager[FileManagerIndex.selector].selected));
  const selectedImportableFiles = useMemo(
    () => selectedImportFiles.filter((file) => file.type === FileType.file && !file.metadata?.[Metadata.restore_uri]),
    [selectedImportFiles],
  );

  const [knowledges, setKnowledges] = useState<GetKnowledgeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, ListDocumentsResponse>>({});
  const documentsRef = useRef<Record<string, ListDocumentsResponse>>({});
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, GetKnowledgeStatsResponse>>({});
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({});
  const [documentFilters, setDocumentFilters] = useState<Record<string, DocumentFilterValue>>({});
  const [documentSearches, setDocumentSearches] = useState<Record<string, string>>({});
  const [documentSorts, setDocumentSorts] = useState<Record<string, DocumentSortValue>>({});
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Record<string, string[]>>({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState("");
  const searchDebounceTimers = useRef<Record<string, number>>({});

  const pageSize = 10;

  const loadKnowledges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dispatch(
        listKnowledge({
          pagination: { page, page_size: pageSize },
        }),
      );
      setKnowledges(res.knowledges);
      setTotal(res.pagination.total_items ?? 0);
    } finally {
      setLoading(false);
    }
  }, [dispatch, page]);

  const loadKnowledgeDocuments = useCallback(
    async (id: string, overrides?: Partial<{ page: number; page_size: number; name: string; progress: DocumentFilterValue; path_keyword: string; order_direction: "asc" | "desc"; }>) => {
      setDocLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const documentPage = overrides?.page ?? documentsRef.current[id]?.pagination.page ?? 1;
        const documentPageSize = overrides?.page_size ?? documentsRef.current[id]?.pagination.page_size ?? 10;
        const search = overrides?.name ?? documentSearches[id] ?? "";
        const progress = overrides?.progress ?? documentFilters[id] ?? "all";
        const pathKeyword = overrides?.path_keyword ?? documentSearches[id] ?? "";
        const sort = documentSorts[id] ?? "updated_desc";
        const res = await dispatch(
          listDocuments({
            knowledge_id: id,
            name: search || undefined,
            path_keyword: pathKeyword || undefined,
            progress: progress === "all" ? undefined : progress,
            pagination: {
              page: documentPage,
              page_size: documentPageSize,
              order_by: "updated_at",
              order_direction: overrides?.order_direction ?? (sort === "updated_asc" ? "asc" : "desc"),
            },
          }),
        );
        setDocuments((prev) => ({
          ...prev,
          [id]: {
            ...res,
            documents: res.documents.filter((doc) => doc.url.startsWith(CrUriPrefix)),
          },
        }));
      } finally {
        setDocLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [dispatch, documentFilters, documentSearches, documentSorts],
  );

  const loadKnowledgeStats = useCallback(
    async (id: string) => {
      const res = await dispatch(getKnowledgeStats(id));
      setKnowledgeStats((prev) => ({
        ...prev,
        [id]: res,
      }));
    },
    [dispatch],
  );

  const refreshKnowledgeByIds = useCallback(
    (knowledgeIds: string[]) => {
      knowledgeIds.forEach((knowledgeId) => {
        loadKnowledgeDocuments(knowledgeId).catch(() => undefined);
        loadKnowledgeStats(knowledgeId).catch(() => undefined);
      });
    },
    [loadKnowledgeDocuments, loadKnowledgeStats],
  );
  const {
    cancelTasks,
    failureByDocumentId,
    registerTask,
    resumeTasks,
    resumableSummary,
    summary: taskSummary,
    summaryByKnowledge,
  } = useAiTaskTracker({
    onTaskTick: refreshKnowledgeByIds,
  });

  useEffect(() => {
    loadKnowledges();
  }, [loadKnowledges]);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    return () => {
      Object.values(searchDebounceTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (knowledges.length === 0) {
      return;
    }

    knowledges.forEach((knowledge) => {
      if (!knowledgeStats[knowledge.id]) {
        loadKnowledgeStats(knowledge.id).catch(() => undefined);
      }
    });
  }, [knowledgeStats, knowledges, loadKnowledgeStats]);

  const toggleExpand = useCallback(
    async (id: string) => {
      if (expandedId === id) {
        setExpandedId(null);
        return;
      }

      setExpandedId(id);
      if (!documents[id]) {
        await loadKnowledgeDocuments(id);
      }
    },
    [documents, expandedId, loadKnowledgeDocuments],
  );

  useEffect(() => {
    if (!expandedId) {
      return;
    }

    const currentDocuments = documents[expandedId]?.documents ?? [];
    const hasPendingDocument = currentDocuments.some(
      (doc) => doc.progress === DocumentProgress.Pending || doc.progress === DocumentProgress.Processing,
    );

    if (!hasPendingDocument) {
      return;
    }

    const timer = window.setInterval(() => {
      loadKnowledgeDocuments(expandedId).catch(() => undefined);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [documents, expandedId, loadKnowledgeDocuments]);

  const handleOpenImportDialog = useCallback(
    (knowledgeId?: string) => {
      setSelectedKnowledgeId(knowledgeId ?? knowledges[0]?.id ?? "");
      setImportDialogOpen(true);
      dispatch(clearSelected({ index: FileManagerIndex.selector, value: undefined }));
    },
    [dispatch, knowledges],
  );

  const handleCloseImportDialog = useCallback(() => {
    if (importing) {
      return;
    }

    setImportDialogOpen(false);
    dispatch(clearSelected({ index: FileManagerIndex.selector, value: undefined }));
  }, [dispatch, importing]);

  const handleImportKnowledgeChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedKnowledgeId(event.target.value);
  }, []);

  const handleImport = useCallback(async () => {
    if (!selectedKnowledgeId) {
      enqueueSnackbar({
        message: t("ai.selectKnowledgeBase"),
        variant: "warning",
        action: DefaultCloseAction,
      });
      return;
    }

    if (selectedImportableFiles.length === 0) {
      enqueueSnackbar({
        message: t("ai.noImportableFiles"),
        variant: "warning",
        action: DefaultCloseAction,
      });
      return;
    }

    setImporting(true);
    try {
      const res = await dispatch(
        createMultiDocuments({
          documents: selectedImportableFiles.map((file) => ({
            knowledge_id: selectedKnowledgeId,
            name: file.name,
            url: getFileLinkedUri(file),
            version: file.primary_entity,
          })),
        }),
      );

      const importedCount = res.documents?.length ?? selectedImportableFiles.length;
      const failedCount = Math.max(selectedImportableFiles.length - importedCount, 0);
      registerTask({
        id: res.task_id,
        knowledgeId: selectedKnowledgeId,
        sources: res.documents.map((document) => ({ documentId: document.id, url: document.url })),
      });

      const messageKey =
        !res.task_id && failedCount === 0
          ? "ai.importNoIndexTask"
          : failedCount > 0
            ? "ai.importQueuedPartialSuccess"
            : "ai.importQueuedSuccess";
      enqueueSnackbar({
        message: t(messageKey, {
          imported: importedCount,
          failed: failedCount,
        }),
        variant: failedCount > 0 ? "warning" : "success",
        action: DefaultCloseAction,
      });

      setImportDialogOpen(false);
      dispatch(clearSelected({ index: FileManagerIndex.selector, value: undefined }));
      setExpandedId(selectedKnowledgeId);
      await Promise.all([loadKnowledgeDocuments(selectedKnowledgeId), loadKnowledgeStats(selectedKnowledgeId)]);
    } catch (_e) {
      enqueueSnackbar({
        message: t("ai.importSubmitFailed"),
        variant: "error",
        action: DefaultCloseAction,
      });
    } finally {
      setImporting(false);
    }
  }, [dispatch, loadKnowledgeDocuments, loadKnowledgeStats, registerTask, selectedImportableFiles, selectedKnowledgeId, t]);

  const handleFilterChange = useCallback((knowledgeId: string, value: string) => {
    setDocumentFilters((prev) => ({ ...prev, [knowledgeId]: value as DocumentFilterValue }));
    setSelectedDocumentIds((prev) => ({ ...prev, [knowledgeId]: [] }));
    loadKnowledgeDocuments(knowledgeId, { page: 1, progress: value as DocumentFilterValue }).catch(() => undefined);
  }, [loadKnowledgeDocuments]);

  const handleSearchChange = useCallback((knowledgeId: string, value: string) => {
    setDocumentSearches((prev) => ({ ...prev, [knowledgeId]: value }));
    setSelectedDocumentIds((prev) => ({ ...prev, [knowledgeId]: [] }));
    const existingTimer = searchDebounceTimers.current[knowledgeId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    searchDebounceTimers.current[knowledgeId] = window.setTimeout(() => {
      loadKnowledgeDocuments(knowledgeId, { page: 1, name: value, path_keyword: value }).catch(() => undefined);
      delete searchDebounceTimers.current[knowledgeId];
    }, 300);
  }, [loadKnowledgeDocuments]);

  const handleSortChange = useCallback((knowledgeId: string, value: string) => {
    setDocumentSorts((prev) => ({ ...prev, [knowledgeId]: value as DocumentSortValue }));
    setSelectedDocumentIds((prev) => ({ ...prev, [knowledgeId]: [] }));
    loadKnowledgeDocuments(knowledgeId, {
      page: 1,
      order_direction: value === "updated_asc" ? "asc" : "desc",
    }).catch(() => undefined);
  }, [loadKnowledgeDocuments]);

  const handleDocumentPageChange = useCallback((knowledgeId: string, nextPage: number) => {
    setSelectedDocumentIds((prev) => ({ ...prev, [knowledgeId]: [] }));
    loadKnowledgeDocuments(knowledgeId, { page: nextPage }).catch(() => undefined);
  }, [loadKnowledgeDocuments]);

  const toggleDocumentSelection = useCallback((knowledgeId: string, documentId: string) => {
    setSelectedDocumentIds((prev) => {
      const current = prev[knowledgeId] ?? [];
      return {
        ...prev,
        [knowledgeId]: current.includes(documentId)
          ? current.filter((id) => id !== documentId)
          : [...current, documentId],
      };
    });
  }, []);

  const selectAllVisibleDocuments = useCallback(
    (knowledgeId: string) => {
      const visibleDocuments = documents[knowledgeId]?.documents ?? [];
      setSelectedDocumentIds((prev) => ({
        ...prev,
        [knowledgeId]: visibleDocuments.map((doc) => doc.id),
      }));
    },
    [documents],
  );

  const clearDocumentSelection = useCallback((knowledgeId: string) => {
    setSelectedDocumentIds((prev) => ({
      ...prev,
      [knowledgeId]: [],
    }));
  }, []);

  const handleCancelIndexTasks = useCallback(
    async (knowledgeId?: string) => {
      const count = knowledgeId ? summaryByKnowledge[knowledgeId]?.count ?? 0 : taskSummary.count;
      if (count === 0) {
        return;
      }

      try {
        await dispatch(confirmOperation(t("ai.confirmCancelIndexTasks", { count })));
      } catch (_e) {
        return;
      }

      await cancelTasks(knowledgeId);
    },
    [cancelTasks, dispatch, summaryByKnowledge, taskSummary.count, t],
  );

  const handleResumeIndexTasks = useCallback(
    async (knowledgeId?: string) => {
      const count = knowledgeId ? resumableSummary.byKnowledge[knowledgeId] ?? 0 : resumableSummary.count;
      if (count === 0) {
        return;
      }

      await resumeTasks(knowledgeId);
    },
    [resumeTasks, resumableSummary],
  );

  const refreshKnowledgeAfterMutation = useCallback(
    async (knowledgeId: string) => {
      await Promise.all([loadKnowledgeDocuments(knowledgeId), loadKnowledgeStats(knowledgeId)]);
      setSelectedDocumentIds((prev) => ({
        ...prev,
        [knowledgeId]: [],
      }));
    },
    [loadKnowledgeDocuments, loadKnowledgeStats],
  );

  const handleDeleteDocument = useCallback(
    async (knowledgeId: string, document: GetDocumentResponse) => {
      try {
        await dispatch(confirmOperation(t("ai.confirmDeleteDocument", { name: document.name })));
      } catch (_e) {
        return;
      }

      await dispatch(deleteDocument(document.id));
      enqueueSnackbar({
        message: t("ai.deleteDocumentSuccess"),
        variant: "success",
        action: DefaultCloseAction,
      });
      await refreshKnowledgeAfterMutation(knowledgeId);
    },
    [dispatch, refreshKnowledgeAfterMutation, t],
  );

  const handleBatchDeleteDocuments = useCallback(
    async (knowledgeId: string) => {
      const ids = selectedDocumentIds[knowledgeId] ?? [];
      if (ids.length === 0) {
        return;
      }

      try {
        await dispatch(confirmOperation(t("ai.confirmBatchDeleteDocuments", { count: ids.length })));
      } catch (_e) {
        return;
      }

      await dispatch(deleteMultiDocuments(ids));
      enqueueSnackbar({
        message: t("ai.batchDeleteDocumentsSuccess", { count: ids.length }),
        variant: "success",
        action: DefaultCloseAction,
      });
      await refreshKnowledgeAfterMutation(knowledgeId);
    },
    [dispatch, refreshKnowledgeAfterMutation, selectedDocumentIds, t],
  );

  const reindexDocuments = useCallback(
    async (knowledgeId: string, targetDocuments: GetDocumentResponse[], successKey: string) => {
      if (targetDocuments.length === 0) {
        return;
      }

      try {
        await dispatch(confirmOperation(t("ai.confirmReindexDocuments", { count: targetDocuments.length })));
      } catch (_e) {
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      let taskCreated = false;

      if (targetDocuments.length === 1) {
        try {
          const res = await dispatch(reindexDocument(targetDocuments[0].id));
          taskCreated = Boolean(res.task_id);
          registerTask({
            id: res.task_id,
            knowledgeId,
            sources: targetDocuments.map((document) => ({ documentId: document.id, url: document.url })),
          });
          successCount = 1;
        } catch (_e) {
          failedCount = 1;
        }
      } else {
        try {
          const res = await dispatch(batchReindexDocuments(targetDocuments.map((doc) => doc.id)));
          taskCreated = Boolean(res.task_id);
          registerTask({
            id: res.task_id,
            knowledgeId,
            sources: targetDocuments.map((document) => ({ documentId: document.id, url: document.url })),
          });
          successCount = res.progresses.length || targetDocuments.length;
          failedCount = taskCreated ? Math.max(targetDocuments.length - successCount, 0) : 0;
        } catch (_e) {
          failedCount = targetDocuments.length;
        }
      }

      const messageKey =
        !taskCreated && failedCount === 0
          ? "ai.reindexNoIndexTask"
          : failedCount > 0
            ? "ai.reindexPartialSuccess"
            : successKey;
      enqueueSnackbar({
        message: t(messageKey, {
          count: successCount,
          failed: failedCount,
        }),
        variant: failedCount > 0 ? "warning" : "success",
        action: DefaultCloseAction,
      });

      await refreshKnowledgeAfterMutation(knowledgeId);
    },
    [dispatch, refreshKnowledgeAfterMutation, registerTask, t],
  );

  const handleReindexDocument = useCallback(
    async (knowledgeId: string, document: GetDocumentResponse) => {
      await reindexDocuments(
        knowledgeId,
        [document],
        document.progress === DocumentProgress.Failed ? "ai.retryIndexSuccess" : "ai.reindexDocumentSuccess",
      );
    },
    [reindexDocuments],
  );

  const handleBatchReindexFailed = useCallback(
    async (knowledgeId: string) => {
      const targetDocuments = (documents[knowledgeId]?.documents ?? []).filter(
        (doc) => (selectedDocumentIds[knowledgeId] ?? []).includes(doc.id) && doc.progress === DocumentProgress.Failed,
      );
      await reindexDocuments(knowledgeId, targetDocuments, "ai.retryFailedDocumentsSuccess");
    },
    [documents, reindexDocuments, selectedDocumentIds],
  );

  const allLoadedDocuments = useMemo(
    () => Object.values(documents).flatMap((value) => value.documents),
    [documents],
  );
  const aggregatedStats = useMemo(
    () =>
      Object.values(knowledgeStats).reduce(
        (acc, value) => {
          acc.documentCount += value.document_count;
          acc.readyCount += value.ready;
          acc.processingCount += value.processing;
          acc.failedCount += value.failed;
          acc.successCount += value.success;
          acc.totalTokens += value.total_tokens;
          return acc;
        },
        {
          documentCount: 0,
          readyCount: 0,
          processingCount: 0,
          failedCount: 0,
          successCount: 0,
          totalTokens: 0,
        },
      ),
    [knowledgeStats],
  );

  const summary = useMemo(() => {
    const readyCount =
      aggregatedStats.readyCount || allLoadedDocuments.filter((doc) => doc.progress === DocumentProgress.Success).length;
    const processingCount =
      aggregatedStats.processingCount ||
      allLoadedDocuments.filter((doc) => doc.progress === DocumentProgress.Pending || doc.progress === DocumentProgress.Processing).length;
    const failedCount =
      aggregatedStats.failedCount || allLoadedDocuments.filter((doc) => doc.progress === DocumentProgress.Failed).length;
    const documentCount = aggregatedStats.documentCount || allLoadedDocuments.length;
    const successCount = aggregatedStats.successCount || readyCount;

    return {
      knowledgeCount: knowledges.length,
      documentCount,
      readyCount,
      processingCount,
      failedCount,
      successRate: documentCount > 0 ? Math.round((successCount / documentCount) * 100) : 0,
      totalTokens: aggregatedStats.totalTokens,
      activeTaskCount: taskSummary.count,
      activeTaskProgress: taskSummary.progress,
      resumableTaskCount: resumableSummary.count,
    };
  }, [aggregatedStats, allLoadedDocuments, knowledges.length, resumableSummary.count, taskSummary]);

  return (
    <Box sx={{ p: 2, maxWidth: 1120, mx: "auto", height: "100%", overflow: "auto" }}>
      <Stack spacing={2}>
        <KnowledgeOverview
          stats={summary}
          onImport={() => handleOpenImportDialog()}
          onCancelTasks={() => handleCancelIndexTasks()}
          onResumeTasks={() => handleResumeIndexTasks()}
        />

        {loading && knowledges.length === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        <Stack spacing={1.5}>
          {knowledges.map((knowledge) => (
            <KnowledgeCard
              key={knowledge.id}
              knowledge={knowledge}
              expanded={expandedId === knowledge.id}
              documents={documents[knowledge.id]?.documents ?? []}
              knowledgeStats={knowledgeStats[knowledge.id]}
              loading={!!docLoading[knowledge.id]}
              page={documents[knowledge.id]?.pagination.page ?? 1}
              pageSize={documents[knowledge.id]?.pagination.page_size ?? 10}
              total={documents[knowledge.id]?.pagination.total_items ?? 0}
              filter={documentFilters[knowledge.id] ?? "all"}
              search={documentSearches[knowledge.id] ?? ""}
              sort={documentSorts[knowledge.id] ?? "updated_desc"}
              selectedIds={selectedDocumentIds[knowledge.id] ?? []}
              activeTaskCount={summaryByKnowledge[knowledge.id]?.count ?? 0}
              activeTaskProgress={summaryByKnowledge[knowledge.id]?.progress}
              resumableTaskCount={resumableSummary.byKnowledge[knowledge.id] ?? 0}
              documentFailures={failureByDocumentId}
              onToggle={() => toggleExpand(knowledge.id)}
              onImport={() => handleOpenImportDialog(knowledge.id)}
              onStartRagChat={() => onStartRagChat?.(knowledge.id)}
              onFilterChange={(value) => handleFilterChange(knowledge.id, value)}
              onSearchChange={(value) => handleSearchChange(knowledge.id, value)}
              onSortChange={(value) => handleSortChange(knowledge.id, value)}
              onPageChange={(nextPage) => handleDocumentPageChange(knowledge.id, nextPage)}
              onToggleSelect={(documentId) => toggleDocumentSelection(knowledge.id, documentId)}
              onSelectAllVisible={() => selectAllVisibleDocuments(knowledge.id)}
              onClearSelection={() => clearDocumentSelection(knowledge.id)}
              onBatchDelete={() => handleBatchDeleteDocuments(knowledge.id)}
              onBatchReindexFailed={() => handleBatchReindexFailed(knowledge.id)}
              onCancelTasks={() => handleCancelIndexTasks(knowledge.id)}
              onResumeTasks={() => handleResumeIndexTasks(knowledge.id)}
              onDelete={(document) => handleDeleteDocument(knowledge.id, document)}
              onReindex={(document) => handleReindexDocument(knowledge.id, document)}
            />
          ))}
        </Stack>

        {total > pageSize && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(_event, value) => setPage(value)} />
          </Box>
        )}
      </Stack>

      <KnowledgeImportDialog
        open={importDialogOpen}
        loading={importing}
        knowledges={knowledges}
        selectedKnowledgeId={selectedKnowledgeId}
        selectedFileCount={selectedImportableFiles.length}
        onClose={handleCloseImportDialog}
        onImport={handleImport}
        onKnowledgeChange={handleImportKnowledgeChange}
      />
    </Box>
  );
};

export default KnowledgeTab;
