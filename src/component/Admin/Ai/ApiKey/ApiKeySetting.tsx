import { Badge, Box, Button, Checkbox, Container, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next"
import { useAppDispatch } from "../../../../redux/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiApiKey } from "../../../../api/dashboard";
import { useQueryState } from "nuqs";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../../StoragePolicy/StoragePolicySetting";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { batchDeleteApiKeys, getApiKeyList } from "../../../../api/api";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import PageContainer from "../../../Pages/PageContainer";
import NewApiKeyDialog from "./NewApiKeyDialog";
import ApiKeyDialog from "./ApiKeyDialog/ApiKeyDialog";
import PageHeader from "../../../Pages/PageHeader";
import Add from "../../../Icons/Add";
import ApiKeyFilterPopover from "./ApiKeyFilterPopover";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import Delete from "../../../Icons/Delete";
import Filter from "../../../Icons/Filter";
import ApiKeyRow from "./ApiKeyRow";
import TablePagination from "../../Common/TablePagination";
import { AdminAiQuery, AiTableColumnWidth, buildConditions, parseAiStatusFilter } from "../constants";

const ApiKeySetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<AiApiKey[]>([]);

  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(AdminAiQuery.common.name, { defaultValue: "" });
  const [platform, setPlatform] = useQueryState(AdminAiQuery.common.platform, { defaultValue: "" });
  const [status, setStatus] = useQueryState(AdminAiQuery.common.status, {
    defaultValue: "",
    parse: parseAiStatusFilter,
  });
  const [count, setCount] = useState(0);

  const [selected, setSelected] = useState<readonly number[]>([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "apikeyFilterPopover",
  });
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyDialogID, setApiKeyDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;
  const statusFilter = parseAiStatusFilter(status);

  const clearFilters = useCallback(() => {
    setName("");
    setPlatform("");
    setStatus("");
  }, [setName, setPlatform, setStatus]);

  useEffect(() => {
    fetchApiKeys();
  }, [page, pageSize, orderBy, orderDirection, name, platform, status]);

  const fetchApiKeys = () => {
    setLoading(true);
    setSelected([]);
    dispatch(getApiKeyList({
      page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: buildConditions({
          name,
          platform,
          status: statusFilter,
        }),
    }))
      .then((res) => {
        setApiKeys(res.api_keys);
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
    dispatch(confirmOperation(t("apikey.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteApiKeys({ ids: Array.from(selected) }))
          .then(() => {
            fetchApiKeys();
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
      const newSelected = apiKeys.map((k) => k.id);
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
    return !!(name || platform || statusFilter);
  }, [name, platform, statusFilter]);

  const handleApiKeyDialogOpen = (id: number) => {
    setApiKeyDialogID(id);
    setApiKeyDialogOpen(true);
  };

  return (
    <PageContainer>
      <NewApiKeyDialog
        open={createNewOpen}
        onClose={() => setCreateNewOpen(false)}
        onCreated={(apikey) => {
          setApiKeyDialogID(apikey.id);
          setApiKeyDialogOpen(true);
        }}
      />

      <ApiKeyDialog
        open={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
        apiKeyID={apiKeyDialogID}
        onUpdated={() => fetchApiKeys()}
      />

      <Container maxWidth="xl">
        <PageHeader title={t("dashboard.nav.apikeys")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={() => setCreateNewOpen(true)} variant={"contained"} startIcon={<Add />}>
            {t("group.create")}
          </Button>

          <ApiKeyFilterPopover
            {...bindPopover(filterPopupState)}
            name={name}
            setName={setName}
            platform={platform}
            setPlatform={setPlatform}
            status={statusFilter}
            setStatus={(value) => setStatus(value)}
            clearFilters={clearFilters}
          />

          <SecondaryButton onClick={fetchApiKeys} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("apikey.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("apikey.deleteXApiKeys", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>

        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("apikey.deleteXApiKeys", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < apiKeys.length}
                    checked={apiKeys.length > 0 && selected.length === apiKeys.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={AiTableColumnWidth.id} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.longText}>
                  <TableSortLabel active={orderBy === "name"} direction={direction} onClick={onSortClick("name")}>
                    {t("apikey.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.extraLongText}>
                  {t("apikey.apiKey")}
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.mediumText}>
                  {t("apikey.platform")}
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.longText}>
                  {t("apikey.url")}
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.action} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                apiKeys.map((apiKey) => (
                  <ApiKeyRow
                    deleting={deleteLoading}
                    key={apiKey.id}
                    apiKey={apiKey}
                    onDelete={fetchApiKeys}
                    selected={selected.includes(apiKey.id)}
                    onSelect={handleSelect}
                    onDetails={handleApiKeyDialogOpen}
                  />
                ))}
                {loading &&
                  apiKeys.length > 0 &&
                  apiKeys.slice(0, 10).map((apiKey) => <ApiKeyRow key={`loading-${apiKey.id}`} loading={true} />)}
                {loading &&
                  apiKeys.length === 0 &&
                  Array.from(Array(5)).map((_, index) => <ApiKeyRow key={`loading-${index}`} loading={true} />)}
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

export default ApiKeySetting;
