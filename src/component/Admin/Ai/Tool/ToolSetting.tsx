import { Add, Delete, Filter } from "@mui/icons-material";
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
import { batchDeleteTools, getToolList } from "../../../../api/api";
import { AiTool } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import TablePagination from "../../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../../StoragePolicy/StoragePolicySetting";
import NewToolDialog from "./NewToolDialog";
import ToolDialog from "./ToolDialog/ToolDialog";
import ToolFilterPopover from "./ToolFilterPopover";
import ToolRow from "./ToolRow";

export const NameQuery = "name";
export const TypeQuery = "type";

const ToolSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<AiTool[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(NameQuery, { defaultValue: "" });
  const [type, setType] = useQueryState(TypeQuery, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "toolFilterPopover",
  });
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [toolDialogID, setToolDialogID] = useState<number | undefined>(undefined);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setName("");
    setType("");
  }, [setName, setType]);

  useEffect(() => {
    fetchTools();
  }, [page, pageSize, orderBy, orderDirection, name, type]);

  const fetchTools = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getToolList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          name: name,
          type: type,
        },
      }),
    )
      .then((res) => {
        setTools(res.tools);
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
    dispatch(confirmOperation(t("tool.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteTools({ ids: Array.from(selected) }))
          .then(() => {
            fetchTools();
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
      const newSelected = tools.map((n) => n.id);
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
    return !!(name || type);
  }, [name, type]);

  const handleToolDialogOpen = (id: number) => {
    setToolDialogID(id);
    setToolDialogOpen(true);
  };

  return (
    <PageContainer>
      <NewToolDialog
        open={createNewOpen}
        onClose={() => setCreateNewOpen(false)}
        onCreated={(tool) => {
          setToolDialogID(tool.id);
          setToolDialogOpen(true);
        }}
      />
      <ToolDialog
        open={toolDialogOpen}
        onClose={() => setToolDialogOpen(false)}
        toolID={toolDialogID}
        onUpdated={(tool) => {
          setToolDialogID(tool.id);
          setToolDialogOpen(true);
        }}
      />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.tools")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={() => setCreateNewOpen(true)} variant={"contained"} startIcon={<Add />}>
            {t("tool.new")}
          </Button>

          <SecondaryButton onClick={fetchTools} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <ToolFilterPopover
            {...bindPopover(filterPopupState)}
            name={name}
            setName={setName}
            type={type}
            setType={setType}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("tool.deleteXTools", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("tool.deleteXTools", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < tools.length}
                    checked={tools.length > 0 && selected.length === tools.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={150}>
                  <TableSortLabel active={orderBy === "name"} direction={direction} onClick={onSortClick("name")}>
                    {t("tool.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("tool.description")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>
                  <TableSortLabel active={orderBy === "type"} direction={direction} onClick={onSortClick("type")}>
                    {t("tool.type")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("tool.parameters")}</NoWrapTableCell>
                <NoWrapTableCell width={100} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                tools.map((tool) => (
                  <ToolRow
                    deleting={deleteLoading}
                    key={tool.id}
                    tool={tool}
                    onDelete={fetchTools}
                    selected={selected.includes(tool.id)}
                    onSelect={handleSelect}
                    onDetails={handleToolDialogOpen}
                  />
                ))}
              {loading &&
                tools.length > 0 &&
                tools.slice(0, 10).map((tool) => <ToolRow key={`loading-${tool.id}`} loading={true} />)}
              {loading &&
                tools.length === 0 &&
                Array.from(Array(10)).map((_, index) => <ToolRow key={`loading-${index}`} loading={true} />)}
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

export default ToolSetting;
