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
import { batchDeleteChatRoles, getChatRoleList } from "../../../../api/api";
import { AiChatRole } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import TablePagination from "../../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../../StoragePolicy/StoragePolicySetting";
import { AdminAiQuery, AiTableColumnWidth, buildConditions } from "../constants";
import ChatRoleDialog from "./ChatRoleDialog/ChatRoleDialog";
import ChatRoleFilterPopover from "./ChatRoleFilterPopover";
import ChatRoleRow from "./ChatRoleRow";
import NewChatRoleDialog from "./NewChatRoleDialog";

const ChatRoleSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AiChatRole[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [name, setName] = useQueryState(AdminAiQuery.common.name, { defaultValue: "" });
  const [userId, setUserId] = useQueryState(AdminAiQuery.common.userId, { defaultValue: "" });
  const [publicStatus, setPublicStatus] = useQueryState(AdminAiQuery.role.publicStatus, { defaultValue: "" });
  const [category, setCategory] = useQueryState(AdminAiQuery.role.category, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "roleFilterPopover",
  });
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogID, setRoleDialogID] = useState<number | undefined>(undefined);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setName("");
    setUserId("");
    setPublicStatus("");
    setCategory("");
  }, [setName, setUserId, setPublicStatus, setCategory]);

  useEffect(() => {
    fetchRoles();
  }, [page, pageSize, orderBy, orderDirection, name, userId, publicStatus, category]);

  const fetchRoles = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getChatRoleList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: buildConditions({
          name,
          user_id: userId,
          public_status: publicStatus,
          category,
        }),
      }),
    )
      .then((res) => {
        setRoles(res.roles);
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
    dispatch(confirmOperation(t("role.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteChatRoles({ ids: Array.from(selected) }))
          .then(() => {
            fetchRoles();
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
      const newSelected = roles.map((n) => n.role.id);
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
    return !!(name || userId || publicStatus || category);
  }, [name, userId, publicStatus, category]);

  const handleRoleDialogOpen = (id: number) => {
    setRoleDialogID(id);
    setRoleDialogOpen(true);
  };

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  return (
    <PageContainer>
      <NewChatRoleDialog
        open={createNewOpen}
        onClose={() => setCreateNewOpen(false)}
        onCreated={(role) => {
          setRoleDialogID(role.role.id);
          setRoleDialogOpen(true);
        }}
      />
      <ChatRoleDialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        roleID={roleDialogID}
        onUpdated={(role) => {
          setRoleDialogID(role.role.id);
          setRoleDialogOpen(true);
        }}
      />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.roles")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={() => setCreateNewOpen(true)} variant={"contained"} startIcon={<Add />}>
            {t("role.new")}
          </Button>

          <SecondaryButton onClick={fetchRoles} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <ChatRoleFilterPopover
            {...bindPopover(filterPopupState)}
            name={name}
            setName={setName}
            userId={userId}
            setUserId={setUserId}
            publicStatus={publicStatus}
            setPublicStatus={setPublicStatus}
            category={category}
            setCategory={setCategory}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("role.deleteXRoles", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("role.deleteXRoles", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < roles.length}
                    checked={roles.length > 0 && selected.length === roles.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={AiTableColumnWidth.id} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.extraLongText}>
                  <TableSortLabel active={orderBy === "name"} direction={direction} onClick={onSortClick("name")}>
                    {t("role.name")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.mediumText}>{t("role.owner")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.shortText}>{t("role.publicStatus")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.mediumText}>{t("role.category")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.action} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                roles.map((role) => (
                  <ChatRoleRow
                    deleting={deleteLoading}
                    key={role.role.id}
                    role={role}
                    onDelete={fetchRoles}
                    selected={selected.includes(role.role.id)}
                    onSelect={handleSelect}
                    onDetails={handleRoleDialogOpen}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
              {loading &&
                roles.length > 0 &&
                roles.slice(0, 10).map((role) => <ChatRoleRow key={`loading-${role.role.id}`} loading={true} />)}
              {loading &&
                roles.length === 0 &&
                Array.from(Array(10)).map((_, index) => <ChatRoleRow key={`loading-${index}`} loading={true} />)}
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

export default ChatRoleSetting;
