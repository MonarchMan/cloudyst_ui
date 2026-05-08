import { Badge, Box, Button, Checkbox, Container, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, useMediaQuery, useTheme } from "@mui/material";
import { AiKnowledgeDocument } from "../../../../api/dashboard";
import { batchDeleteDocuments, getDocumentList } from "../../../../api/api";
import { Add, Filter, Delete } from "@mui/icons-material";
import { bindPopover, bindTrigger } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { SecondaryButton, StyledTableContainerPaper, NoWrapTableCell } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import { PageQuery, PageSizeQuery, OrderByQuery, OrderDirectionQuery } from "../../StoragePolicy/StoragePolicySetting";
import DocumentDialog from "./KnowledgeDocumentDialog/DocumentDialog";
import DocumentRow from "./DocumentRow";
import TablePagination from "../../Common/TablePagination";
import DocumentFilterPopover from "./DocumentFilterPopover";

export const NameQuery = "name";
export const KnowledgeQuery = "knowledge_id";
export const StatusQuery = "status";

const documentSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<AiKnowledgeDocument[]>([]);

  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(NameQuery, { defaultValue: "" });
  const [knowledge, setKnowledge] = useQueryState(KnowledgeQuery, { defaultValue: ""});
  const [status, setStatus] = useQueryState(StatusQuery, { 
    defaultValue: 0,
    parse: (value) => parseInt(value) || 0,
    serialize: (value) => value.toString()
  });
  const [count, setCount] = useState(0);

  const [selected, setSelected] = useState<readonly number[]>([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "documentFilterPopover",
  });
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentDialogID, setDocumentDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;

  const clearFilters = useCallback(() => {
    setName("");
    setKnowledge("");
    setStatus(0);
  }, [setName, setKnowledge, setStatus]);

  useEffect(() => {
    fetchdocuments();
  }, [page, pageSize, orderBy, orderDirection, name, knowledge, status]);

  const fetchdocuments = () => {
    setLoading(true);
    setSelected([]);
    dispatch(getDocumentList({
      page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          name: name,
          knowledgeID: knowledge,
          status: status.toString(),
        },
    }))
      .then((res) => {
        setDocuments(res.documents);
        setPageSize(res.pagination.page_size.toString());
        setCount(res.pagination.total_items ?? 0);
        setLoading(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    dispatch(confirmOperation(t("document.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteDocuments({ ids: Array.from(selected) }))
          .then(() => {
            fetchdocuments();
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
      const newSelected = documents.map((k) => k.id);
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
    return !!(name || knowledge || status);
  }, [name, knowledge, status]);

  const handledocumentDialogOpen = (id: number) => {
    setDocumentDialogID(id);
    setDocumentDialogOpen(true);
  };

  return (
    <PageContainer>
      <DocumentDialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        documentID={documentDialogID}
        onUpdated={() => fetchdocuments()}
      />

      <Container maxWidth="xl">
        <PageHeader title={t("dashboard.nav.documents")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={() => setCreateNewOpen(true)} variant={"contained"} startIcon={<Add />}>
            {t("group.create")}
          </Button>

          <DocumentFilterPopover
            {...bindPopover(filterPopupState)}
            name={name}
            setName={setName}
            knowledge={knowledge}
            setKnowledge={setKnowledge}
            status={status}
            setStatus={setStatus}
            clearFilters={clearFilters}
          />

          <SecondaryButton onClick={fetchdocuments} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("document.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("document.deleteXdocuments", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>

        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("document.deleteXdocuments", { num: selected.length })}
            </Button>
          </Stack>
        )}

        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={50}>
                  <Checkbox
                    size="small"
                    disableRipple
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < documents.length}
                    checked={documents.length > 0 && selected.length === documents.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={250}>
                  <TableSortLabel active={orderBy === "name"} direction={direction} onClick={onSortClick("name")}>
                    {t("document.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={250}>{t("document.url")}</NoWrapTableCell>
                <NoWrapTableCell width={60}>{t("document.version")}</NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "contentLength"} direction={direction} onClick={onSortClick("contentLength")}>
                    {t("document.contentLength")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "tokens"} direction={direction} onClick={onSortClick("tokens")}>
                    {t("document.tokens")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "segmentMaxContexts"} direction={direction} onClick={onSortClick("segmentMaxContexts")}>
                    {t("document.segmentMaxContexts")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "retrievalCount"} direction={direction} onClick={onSortClick("retrievalCount")}>
                    {t("document.retrievalCount")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("document.knowledge")}</NoWrapTableCell>
                <NoWrapTableCell width={100} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                documents.map((document) => (
                  <DocumentRow
                    deleting={deleteLoading}
                    key={document.id}
                    document={document}
                    onDelete={fetchdocuments}
                    selected={selected.includes(document.id)}
                    onSelect={handleSelect}
                    onDetails={handledocumentDialogOpen}
                  />
                ))}
                {loading &&
                  documents.length > 0 &&
                  documents.slice(0, 10).map((document) => <DocumentRow key={`loading-${document.id}`} loading={true} />)}
                {loading &&
                  documents.length === 0 &&
                  Array.from(Array(5)).map((_, index) => <DocumentRow key={`loading-${index}`} loading={true} />)}
            </TableBody>
          </Table>
        </TableContainer>
        {
          count > 0 && (
            <Box sx={{ mt: 2 }}>
              <TablePagination
                page={pageInt}
                totalItems={count}
                rowsPerPage={pageSizeInt}
                rowsPerPageOptions={[10, 25, 50, 100, 200]}
                onRowsPerPageChange={(value) => setPageSize(value.toString())}
                onChange={(_, value) => setPage(value.toString())}
              />
            </Box>
          )}
      </Container>
    </PageContainer>
  );
};