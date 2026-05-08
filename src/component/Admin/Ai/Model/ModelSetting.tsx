import { Add, Filter, Delete } from "@mui/icons-material";
import { useMediaQuery, Container, Stack, Button, Badge, Divider, TableContainer, Table, TableHead, TableRow, TableCell, Checkbox, TableSortLabel, TableBody, Box, useTheme } from "@mui/material";
import { bindPopover, bindTrigger } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteModels, getModelList } from "../../../../api/api";
import { AiModel } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { SecondaryButton, StyledTableContainerPaper, NoWrapTableCell } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import { PageQuery, PageSizeQuery, OrderByQuery, OrderDirectionQuery } from "../../StoragePolicy/StoragePolicySetting";
import ApiKeyFilterPopover from "../ApiKey/ApiKeyFilterPopover";
import ModelDialog from "./ModelDialog/ModelDialog";
import NewModelDialog from "./NewModelDialog";
import ModelRow from "./ModelRow";
import TablePagination from "../../Common/TablePagination";

export const NameQuery = "name";
export const PlatformQuery = "platform";
export const StatusQuery = "status";

const ModelSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModel[]>([]);

  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(NameQuery, { defaultValue: "" });
  const [platform, setPlatform] = useQueryState(PlatformQuery, { defaultValue: "" });
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
    popupId: "modelFilterPopover",
  });
  const [modelDialogOpen, setmodelDialogOpen] = useState(false);
  const [modelDialogID, setmodelDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;

  const clearFilters = useCallback(() => {
    setName("");
    setPlatform("");
    setStatus(0);
  }, [setName, setPlatform, setStatus]);

  useEffect(() => {
    fetchmodels();
  }, [page, pageSize, orderBy, orderDirection, name, platform, status]);

  const fetchmodels = () => {
    setLoading(true);
    setSelected([]);
    dispatch(getModelList({
      page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          name: name,
          platform: platform,
          status: status.toString(),
        },
    }))
      .then((res) => {
        setModels(res.models);
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
    dispatch(confirmOperation(t("model.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteModels({ ids: Array.from(selected) }))
          .then(() => {
            fetchmodels();
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
      const newSelected = models.map((k) => k.id);
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
    return !!(name || platform || status);
  }, [name, platform, status]);

  const handlemodelDialogOpen = (id: number) => {
    setmodelDialogID(id);
    setmodelDialogOpen(true);
  };

  return (
    <PageContainer>
      <NewModelDialog
        open={createNewOpen}
        onClose={() => setCreateNewOpen(false)}
        onCreated={(model) => {
          setmodelDialogID(model.id);
          setmodelDialogOpen(true);
        }}
      />

      <ModelDialog
        open={modelDialogOpen}
        onClose={() => setmodelDialogOpen(false)}
        modelID={modelDialogID}
        onUpdated={() => fetchmodels()}
      />

      <Container maxWidth="xl">
        <PageHeader title={t("dashboard.nav.models")} />
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
            status={status}
            setStatus={setStatus}
            clearFilters={clearFilters}
          />

          <SecondaryButton onClick={fetchmodels} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("model.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("model.deleteXmodels", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>

        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("model.deleteXmodels", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < models.length}
                    checked={models.length > 0 && selected.length === models.length}
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
                    {t("model.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={250}>
                  <TableSortLabel active={orderBy === "platform"} direction={direction} onClick={onSortClick("platform")}>
                    {t("model.platform")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "sort"} direction={direction} onClick={onSortClick("sort")}>
                    {t("model.sort")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "temperature"} direction={direction} onClick={onSortClick("temperature")}>
                    {t("model.temperature")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "maxTokens"} direction={direction} onClick={onSortClick("maxTokens")}>
                    {t("model.maxTokens")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60}>
                  <TableSortLabel active={orderBy === "maxContexts"} direction={direction} onClick={onSortClick("maxContexts")}>
                    {t("model.maxContexts")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("model.apiKey")}</NoWrapTableCell>
                <NoWrapTableCell width={100} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                models.map((model) => (
                  <ModelRow
                    deleting={deleteLoading}
                    key={model.id}
                    model={model}
                    onDelete={fetchmodels}
                    selected={selected.includes(model.id)}
                    onSelect={handleSelect}
                    onDetails={handlemodelDialogOpen}
                  />
                ))}
                {loading &&
                  models.length > 0 &&
                  models.slice(0, 10).map((model) => <ModelRow key={`loading-${model.id}`} loading={true} />)}
                {loading &&
                  models.length === 0 &&
                  Array.from(Array(5)).map((_, index) => <ModelRow key={`loading-${index}`} loading={true} />)}
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

export default ModelSetting;