import { Delete } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteSegments, getSegmentList } from "../../../../api/api";
import { AiKnowledgeSegment } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import Filter from "../../../Icons/Filter";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import TablePagination from "../../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../../StoragePolicy/StoragePolicySetting";
import { AdminAiQuery, AiTableColumnWidth, buildConditions } from "../constants";
import KnowledgeSegmentFilterPopover from "./KnowledgeSegmentFilterPopover";
import KnowledgeSegmentRow from "./KnowledgeSegmentRow";

const KnowledgeSegmentSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<AiKnowledgeSegment[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [documentId, setDocumentId] = useQueryState(AdminAiQuery.common.documentId, { defaultValue: "" });
  const [knowledgeId, setKnowledgeId] = useQueryState(AdminAiQuery.common.knowledgeId, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "segmentFilterPopover",
  });

  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [segmentDialogID, setSegmentDialogID] = useState<number>(0);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setDocumentId("");
    setKnowledgeId("");
  }, [setDocumentId, setKnowledgeId]);

  useEffect(() => {
    fetchSegments();
  }, [page, pageSize, orderBy, orderDirection, documentId, knowledgeId]);

  const fetchSegments = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getSegmentList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: buildConditions({
          document_id: documentId,
          knowledge_id: knowledgeId,
        }),
      }),
    )
      .then((res) => {
        setSegments(res.segments);
        setPageSize(res.pagination.page_size.toString());
        setCount(res.pagination.total_items ?? 0);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    dispatch(confirmOperation(t("segment.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteSegments({ ids: Array.from(selected) }))
          .then(() => {
            fetchSegments();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = segments.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = useCallback(
    (id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
    },
    [selected],
  );

  const orderById = orderBy === "id" || orderBy === "";
  const direction = orderDirection as "asc" | "desc";
  const onSortClick = (field: string) => () => {
    const alreadySorted = orderBy === field || (field === "id" && orderById);
    setOrderBy(field);
    setOrderDirection(alreadySorted ? (direction === "asc" ? "desc" : "asc") : "asc");
  };

  const hasActiveFilters = useMemo(() => {
    return !!(documentId || knowledgeId);
  }, [documentId, knowledgeId]);

  const handleSegmentDialogOpen = (id: number) => {
    setSegmentDialogID(id);
    setSegmentDialogOpen(true);
  }

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.segments")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <SecondaryButton onClick={fetchSegments} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <KnowledgeSegmentFilterPopover
            {...bindPopover(filterPopupState)}
            documentId={documentId}
            setDocumentId={setDocumentId}
            knowledgeId={knowledgeId}
            setKnowledgeId={setKnowledgeId}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("segment.deleteXSegments", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("segment.deleteXSegments", { num: selected.length })}
            </Button>
          </Stack>
        )}
        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={AiTableColumnWidth.checkbox}>
                  <Checkbox
                    size="small"
                    disableRipple
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < segments.length}
                    checked={segments.length > 0 && selected.length === segments.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={AiTableColumnWidth.id} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.shortText}>{t("segment.documentId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.shortText}>{t("segment.knowledgeId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>
                  <TableSortLabel active={orderBy === "content_length"} direction={direction} onClick={onSortClick("content_length")}>
                    {t("segment.contentLength")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>
                  <TableSortLabel active={orderBy === "tokens"} direction={direction} onClick={onSortClick("tokens")}>
                    {t("segment.tokens")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.extraLongText}>{t("segment.vectorId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>
                  <TableSortLabel active={orderBy === "retrival_count"} direction={direction} onClick={onSortClick("retrival_count")}>
                    {t("segment.retrivalCount")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.action} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                segments.map((segment) => (
                  <KnowledgeSegmentRow
                    deleting={deleteLoading}
                    key={segment.id}
                    segment={segment}
                    onDelete={fetchSegments}
                    selected={selected.includes(segment.id)}
                    onSelect={handleSelect}
                    onDetails={handleSegmentDialogOpen}
                  />
                ))}
              {loading &&
                segments.length > 0 &&
                segments.slice(0, 10).map((segment) => <KnowledgeSegmentRow key={`loading-${segment.id}`} loading={true} />)}
              {loading &&
                segments.length === 0 &&
                Array.from(Array(10)).map((_, index) => <KnowledgeSegmentRow key={`loading-${index}`} loading={true} />)}
            </TableBody>
          </Table>
        </TableContainer>
        {count > 0 && (
          <Box sx={{ mt: 1 }}>
            <TablePagination
              page={pageInt}
              totalItems={count}
              rowsPerPage={pageSizeInt}
              rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
              onRowsPerPageChange={(value) => setPageSize(value.toString())}
              onChange={(_, value) => setPage(value.toString())}
            />
          </Box>
        )}
      </Container>
    </PageContainer>
  );
};

export default KnowledgeSegmentSetting;
