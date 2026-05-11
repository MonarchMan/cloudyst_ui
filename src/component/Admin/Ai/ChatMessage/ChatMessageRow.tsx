import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteChatMessages } from "../../../../api/api";
import { AiChatMessage } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, NoWrapTypography } from "../../../Common/StyledComponents";
import Delete from "../../../Icons/Delete";
import UserAvatar from "../../../Common/User/UserAvatar";

export interface ChatMessageRowProps {
  message?: AiChatMessage;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openUserDialog?: (id: number) => void;
}

const ChatMessageRow = ({
  message,
  loading,
  deleting,
  selected,
  onDelete,
  onDetails,
  onSelect,
  openUserDialog
}: ChatMessageRowProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onRowClick = () => {
    onDetails?.(message?.message.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("message.confirmDelete", { message: message?.message.id }))).then(() => {
      if (message?.message.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteChatMessages({ ids: [message.message.id] }))
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
    onSelect?.(message?.message.id ?? 0);
  };

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openUserDialog?.(message?.message.user_id ?? 0);
  };

  if (loading) {
    return (
      <TableRow sx={{ height: "43px" }}>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={60} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={200} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  return (
    <TableRow hover key={message?.message.id} sx={{ cursor: "pointer" }} selected={selected}>
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
        <NoWrapTypography variant="inherit">{message?.message.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{message?.message.conversation_id}</NoWrapTypography>
      </NoWrapTableCell>
      
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserAvatar
            sx={{ width: 24, height: 24 }}
            overwriteTextSize
            user={{
              id: message?.owner_info?.id ?? "",
              nickname: message?.owner_info?.nickname ?? "",
              created_at: message?.owner_info?.created_at ?? "",
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
              {message?.owner_info?.nickname}
            </Link>
          </NoWrapTypography>
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{message?.message.model}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{message?.message.type}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
          {message?.message.content}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
          <Delete fontSize="small" />
        </IconButton>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default ChatMessageRow;
