import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteChatConversations } from "../../../../api/api";
import { AiChatConversation } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, NoWrapTypography } from "../../../Common/StyledComponents";
import Delete from "../../../Icons/Delete";
import UserAvatar from "../../../Common/User/UserAvatar";

export interface ChatConversationRowProps {
  conversation?: AiChatConversation;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openUserDialog?: (id: number) => void;
}

const ChatConversationRow = ({ conversation, loading, deleting, selected, onDelete, onDetails, onSelect, openUserDialog }: ChatConversationRowProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onRowClick = () => {
    onDetails?.(conversation?.conversation.id ?? 0);
  }

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("conversation.confirmDelete", { conversation: conversation?.conversation.id }))).then(() => {
      if (conversation?.conversation.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteChatConversations({ ids: [conversation.conversation.id] }))
          .then(() => {
            onDelete?.();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      }
    });
  };

  const onSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(conversation?.conversation.id ?? 0);
  };

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openUserDialog?.(conversation?.conversation.user_id ?? 0);
  };

  if (loading) {
    return (
      <TableRow hover key={conversation?.conversation.id} sx={{ cursor: "pointer" }} onClick={onRowClick} selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            disabled={deleting}
            size="small"
            disableRipple
            color="primary"
            onClick={onSelectClick}
            checked={selected}
          />
        </TableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={60} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  return (
    <TableRow hover key={conversation?.conversation.id} sx={{ cursor: "pointer" }} selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          disabled={deleting}
          size="small"
          disableRipple
          color="primary"
          onClick={onSelectClick}
          checked={selected}
        />
      </TableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{conversation?.conversation.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{conversation?.conversation.title}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{conversation?.conversation.pinned ? t("common.yes") : t("common.no")}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserAvatar
            sx={{ width: 24, height: 24 }}
            overwriteTextSize
            user={{
              id: conversation?.owner_info?.id ?? "",
              nickname: conversation?.owner_info?.nickname ?? "",
              created_at: conversation?.owner_info?.created_at ?? "",
            }}
          />
          <NoWrapTypography variant="inherit">
            <Link
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={userClicked}
              underline="hover"
              href="#/"
            >
              {conversation?.owner_info?.nickname}
            </Link>
          </NoWrapTypography>
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{conversation?.conversation.role_id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{conversation?.conversation.model}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
          <Delete fontSize="small" />
        </IconButton>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default ChatConversationRow;
