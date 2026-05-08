import { Add, Filter, Delete } from "@mui/icons-material";
import { useMediaQuery, Container, Stack, Button, Badge, Divider, TableContainer, Table, TableHead, TableRow, TableCell, Checkbox, TableSortLabel, TableBody, Box, useTheme } from "@mui/material";
import { bindPopover, bindTrigger } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteKnowledges as batchDeleteKnowledges, getKnowledgeList } from "../../../../api/api";
import { AiKnowledge, AiKnowledgeModel } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { SecondaryButton, StyledTableContainerPaper, NoWrapTableCell } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import { PageQuery, PageSizeQuery, OrderByQuery, OrderDirectionQuery } from "../../StoragePolicy/StoragePolicySetting";
import KnowledgeRow from "./KnowledgeRow";
import KnowledgeDialog from "./KnowledgeDialog/KnowledgeDialog";
import NewKnowledgeDialog from "./NewKnowledgeDialog";
import TablePagination from "../../Common/TablePagination";
import KnowledgeFilterPopover from "./KnowledgeFilterPopover";
import UserDialog from "../../User/UserDialog/UserDialog";

export const NameQuery = "name";
export const StatusQuery = "status";
export const IsPublicQuery = "is_public";
export const IsMasterQuery = "is_master";

const KnowledgeSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [knowledges, setKnowledges] = useState<AiKnowledge[]>([]);

  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(NameQuery, { defaultValue: "" });
  const [isPublic, setIsPublic] = useQueryState(IsPublicQuery, { defaultValue: ""});
  const [isMaster, setIsMaster] = useQueryState(IsMasterQuery, { defaultValue: ""});
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
    popupId: "knowledgeFilterPopover",
  });
  
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const [knowledgeDialogID, setKnowledgeDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;

  const clearFilters = useCallback(() => {
    setName("");
    setStatus(0);
    setIsPublic("");
    setIsMaster("");
  }, [setName, setStatus, setIsMaster, setIsPublic]);

  useEffect(() => {
    fetchKnowledges();
  }, [page, pageSize, orderBy, orderDirection, name, status, isPublic, isMaster]);

  const fetchKnowledges = () => {
    setLoading(true);
    setSelected([]);
    dispatch(getKnowledgeList({
      page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          name: name,
          status: status.toString(),
          isPublic: isPublic === "true" ? "true" : "",
          isMaster: isMaster === "true" ? "true" : "",
        },
    }))
      .then((res) => {
        setKnowledges(res.knowledges);
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
    dispatch(confirmOperation(t("knowledge.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteKnowledges({ ids: Array.from(selected) }))
          .then(() => {
            fetchKnowledges();
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
      const newSelected = knowledges.map((k) => k.knowledge.id);
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
    return !!(name || status || isPublic || isMaster);
  }, [name, status, isPublic, isMaster]);

  const handleKnowledgeDialogOpen = (id: number) => {
    setKnowledgeDialogID(id);
    setKnowledgeDialogOpen(true);
  };

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  return (
    <PageContainer>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <NewKnowledgeDialog
        open={createNewOpen}
        onClose={() => setCreateNewOpen(false)}
        onCreated={(knowledge) => {
          setKnowledgeDialogID(knowledge.id);
          setKnowledgeDialogOpen(true);
        }}
      />

      <KnowledgeDialog
        open={knowledgeDialogOpen}
        onClose={() => setKnowledgeDialogOpen(false)}
        knowledgeID={knowledgeDialogID}
        onUpdated={() => fetchKnowledges()}
      />

      <Container maxWidth="xl">
        <PageHeader title={t("dashboard.nav.knowledges")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={() => setCreateNewOpen(true)} variant={"contained"} startIcon={<Add />}>
            {t("group.create")}
          </Button>

          <KnowledgeFilterPopover
            {...bindPopover(filterPopupState)}
            name={name}
            setName={setName}
            status={status}
            setStatus={setStatus}
            clearFilters={clearFilters}
            setIsPublic={(value: boolean) => setIsPublic(value ? "true" : "")}
            isPublic={isPublic === "true"}
            setIsMaster={(value: boolean) => setIsMaster(value ? "true" : "")}
            isMaster={isMaster === "true"}
          />
          <SecondaryButton onClick={fetchKnowledges} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("knowledge.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("knowledge.deleteXKnowledges", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>

        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("knowledge.deleteXKnowledges", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < knowledges.length}
                    checked={knowledges.length > 0 && selected.length === knowledges.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={100}>
                  <TableSortLabel active={orderBy === "name"} direction={direction} onClick={onSortClick("name")}>
                    {t("knowledge.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={100}>
                  <TableSortLabel active={orderBy === "topK"} direction={direction} onClick={onSortClick("topK")}>
                    {t("knowledge.topK")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={100}>
                  <TableSortLabel active={orderBy === "similarity"} direction={direction} onClick={onSortClick("similarity")}>
                    {t("knowledge.similarity")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("knowledge.owner")}</NoWrapTableCell>
                <NoWrapTableCell width={60}>{t("knowledge.isMaster")}</NoWrapTableCell>
                <NoWrapTableCell width={100} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                knowledges.map((knowledge) => (
                  <KnowledgeRow
                    deleting={deleteLoading}
                    key={knowledge.knowledge.id}
                    knowledge={knowledge}
                    onDelete={fetchKnowledges}
                    selected={selected.includes(knowledge.knowledge.id)}
                    onSelect={handleSelect}
                    onDetails={handleKnowledgeDialogOpen}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
                {loading &&
                  knowledges.length > 0 &&
                  knowledges.slice(0, 10).map((knowledge) => <KnowledgeRow key={`loading-${knowledge.knowledge.id}`} loading={true} />)}
                {loading &&
                  knowledges.length === 0 &&
                  Array.from(Array(5)).map((_, index) => <KnowledgeRow key={`loading-${index}`} loading={true} />)}
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

export default KnowledgeSetting;
