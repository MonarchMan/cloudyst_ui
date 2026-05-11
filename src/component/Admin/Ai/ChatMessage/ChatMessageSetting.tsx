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
import { batchDeleteChatMessages, getChatMessageList } from "../../../../api/api";
import { AiChatMessage } from "../../../../api/dashboard";
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
import ChatMessageFilterPopover from "./ChatMessageFilterPopover";
import ChatMessageRow from "./ChatMessageRow";

const ChatMessageSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [conversationId, setConversationId] = useQueryState(AdminAiQuery.message.conversationId, { defaultValue: "" });
  const [userId, setUserId] = useQueryState(AdminAiQuery.common.userId, { defaultValue: "" });
  const [roleId, setRoleId] = useQueryState(AdminAiQuery.common.roleId, { defaultValue: "" });
  const [modelId, setModelId] = useQueryState(AdminAiQuery.common.modelId, { defaultValue: "" });
  const [type, setType] = useQueryState(AdminAiQuery.common.type, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "messageFilterPopover",
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogID, setMessageDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setConversationId("");
    setUserId("");
    setRoleId("");
    setModelId("");
    setType("");
  }, [setConversationId, setUserId, setRoleId, setModelId, setType]);

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize, orderBy, orderDirection, conversationId, userId, roleId, modelId, type]);

  const fetchMessages = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getChatMessageList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: buildConditions({
          conversation_id: conversationId,
          user_id: userId,
          role_id: roleId,
          model_id: modelId,
          type,
        }),
      }),
    )
      .then((res) => {
        setMessages(res.messages);
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
    dispatch(confirmOperation(t("message.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteChatMessages({ ids: Array.from(selected) }))
          .then(() => {
            fetchMessages();
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
      const newSelected = messages.map((n) => n.message.id);
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
    return !!(conversationId || userId || roleId || modelId || type);
  }, [conversationId, userId, roleId, modelId, type]);

  const handleMessageDialogOpen = (id: number) => {
    setMessageDialogID(id);
    setMessageDialogOpen(true);
  };

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.messages")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <SecondaryButton onClick={fetchMessages} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <ChatMessageFilterPopover
            {...bindPopover(filterPopupState)}
            conversationId={conversationId}
            setConversationId={setConversationId}
            userId={userId}
            setUserId={setUserId}
            roleId={roleId}
            setRoleId={setRoleId}
            modelId={modelId}
            setModelId={setModelId}
            type={type}
            setType={setType}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("message.deleteXMessages", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("message.deleteXMessages", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < messages.length}
                    checked={messages.length > 0 && selected.length === messages.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={AiTableColumnWidth.id} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.shortText}>{t("message.conversationId")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.mediumText}>{t("message.user")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.longText}>{t("message.model")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.shortText}>{t("message.type")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.extraLongText}>{t("message.content")}</NoWrapTableCell>
                <NoWrapTableCell width={AiTableColumnWidth.action} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                messages.map((message) => (
                  <ChatMessageRow
                    deleting={deleteLoading}
                    key={message.message.id}
                    message={message}
                    onDelete={fetchMessages}
                    selected={selected.includes(message.message.id)}
                    onSelect={handleSelect}
                    onDetails={handleMessageDialogOpen}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
              {loading &&
                messages.length > 0 &&
                messages.slice(0, 10).map((message) => <ChatMessageRow key={`loading-${message.message.id}`} loading={true} />)}
              {loading &&
                messages.length === 0 &&
                Array.from(Array(10)).map((_, index) => <ChatMessageRow key={`loading-${index}`} loading={true} />)}
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

export default ChatMessageSetting;
