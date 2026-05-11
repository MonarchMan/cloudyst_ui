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
import { batchDeleteChatConversations, getChatConversationList } from "../../../../api/api";
import { AiChatConversation } from "../../../../api/dashboard";
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
import ChatConversationFilterPopover from "./ChatConversationFilterPopover";
import ChatConversationRow from "./ChatConversationRow";

const ChatConversationSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<AiChatConversation[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [title, setTitle] = useQueryState(AdminAiQuery.conversation.title, { defaultValue: "" });
  const [pinned, setPinned] = useQueryState(AdminAiQuery.conversation.pinned, { defaultValue: "" });
  const [userId, setUserId] = useQueryState(AdminAiQuery.common.userId, { defaultValue: "" });
  const [roleId, setRoleId] = useQueryState(AdminAiQuery.common.roleId, { defaultValue: "" });
  const [modelId, setModelId] = useQueryState(AdminAiQuery.common.modelId, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "conversationFilterPopover",
  });
  
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [conversationDialogID, setConversationDialogID] = useState<number | undefined>(undefined);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setTitle("");
    setPinned("");
    setUserId("");
    setRoleId("");
    setModelId("");
  }, [setTitle, setPinned, setUserId, setRoleId, setModelId]);

  useEffect(() => {
    fetchConversations();
  }, [page, pageSize, orderBy, orderDirection, title, pinned, userId, roleId, modelId]);

  const fetchConversations = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getChatConversationList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: buildConditions({
          title,
          pinned,
          user_id: userId,
          role_id: roleId,
          model_id: modelId,
        }),
      }),
    )
      .then((res) => {
        setConversations(res.conversations);
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
    dispatch(confirmOperation(t("conversation.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteChatConversations({ ids: Array.from(selected) }))
          .then(() => {
            fetchConversations();
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
      const newSelected = conversations.map((n) => n.conversation.id);
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
    return !!(title || pinned || userId || roleId || modelId);
  }, [title, pinned, userId, roleId, modelId]);

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  const handleConversationDialogOpen = (id: number) => {
    setConversationDialogID(id);
    setConversationDialogOpen(true);
  };

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.conversations")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <SecondaryButton onClick={fetchConversations} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <ChatConversationFilterPopover
            {...bindPopover(filterPopupState)}
            title={title}
            setTitle={setTitle}
            pinned={pinned}
            setPinned={setPinned}
            userId={userId}
            setUserId={setUserId}
            roleId={roleId}
            setRoleId={setRoleId}
            modelId={modelId}
            setModelId={setModelId}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("conversation.deleteXConversations", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("conversation.deleteXConversations", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < conversations.length}
                    checked={conversations.length > 0 && selected.length === conversations.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={AiTableColumnWidth.id} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.extraLongText}>
                  <TableSortLabel active={orderBy === "title"} direction={direction} onClick={onSortClick("title")}>
                    {t("conversation.title")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>{t("conversation.pinned")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>{t("conversation.userId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.compact}>{t("conversation.roleId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.longText}>{t("conversation.model")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.action} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                conversations.map((conversation) => (
                  <ChatConversationRow
                    deleting={deleteLoading}
                    key={conversation.conversation.id}
                    conversation={conversation}
                    onDelete={fetchConversations}
                    onDetails={handleConversationDialogOpen}
                    selected={selected.includes(conversation.conversation.id)}
                    onSelect={handleSelect}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
              {loading &&
                conversations.length > 0 &&
                conversations.slice(0, 10).map((conversation) => <ChatConversationRow key={`loading-${conversation.conversation.id}`} loading={true} />)}
              {loading &&
                conversations.length === 0 &&
                Array.from(Array(10)).map((_, index) => <ChatConversationRow key={`loading-${index}`} loading={true} />)}
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

export default ChatConversationSetting;
