import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { batchDeleteUser } from "../../../api/api";
import { User, UserStatus } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { sizeToString } from "../../../util";
import { NoWrapTableCell, NoWrapTypography, SquareChip } from "../../Common/StyledComponents";
import UserAvatar from "../../Common/User/UserAvatar";
import Delete from "../../Icons/Delete";
import PersonPasskey from "../../Icons/PersonPasskey";

export interface UserRowProps {
  user?: User;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
}

const UserRow = ({ user, loading, deleting, selected, onDelete, onDetails, onSelect }: UserRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onRowClick = () => {
    onDetails?.(user?.user.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("user.confirmDelete", { user: user?.user.email }))).then(() => {
      if (user?.user.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteUser({ ids: [user.user.id] }))
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
    onSelect?.(user?.user.id ?? 0);
  };

  const userProps = useMemo(() => {
    const res = {
      passkey: false,
      twoFa: false,
    };

    if (user?.user.passkey) {
      res.passkey = true;
    }

    if (user?.two_fa_enabled) {
      res.twoFa = true;
    }

    return res;
  }, [user]);

  if (loading) {
    return (
      <TableRow sx={{ height: "43px" }}>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={60} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={200} />
          </Box>
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={250} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <TableRow hover key={user?.user.id} sx={{ cursor: "pointer" }} onClick={onRowClick} selected={selected}>
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
        <NoWrapTypography variant="inherit">{user?.user.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserAvatar
            sx={{ width: 24, height: 24 }}
            overwriteTextSize
            user={{ id: user?.hash_id ?? "", nickname: user?.user?.nick ?? "", created_at: user?.user.created_at ?? "" }}
          />
          <NoWrapTypography variant="inherit">{user?.user.nick}</NoWrapTypography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {user?.user.status == UserStatus.inactive && <SquareChip size="small" label={t("user.status_inactive")} />}
            {user?.user.status == UserStatus.sys_banned && (
              <SquareChip size="small" color="error" label={t("user.status_sys_banned")} />
            )}
            {user?.user.status == UserStatus.manual_banned && (
              <SquareChip size="small" color="error" label={t("user.status_manual_banned")} />
            )}
            {user?.two_fa_enabled && (
              <Tooltip title={t("user.2FAEnabled")}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonPasskey fontSize="small" sx={{ color: "text.secondary" }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{user?.user.email}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          <Link
            onClick={stopPropagation}
            component={RouterLink}
            to={`/admin/group/${user?.user.group?.id}`}
            underline="hover"
          >
            {user?.user.group?.name}
          </Link>
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>{sizeToString(user?.user.storage ?? 0)}</NoWrapTableCell>
      <NoWrapTableCell>
        <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
          <Delete fontSize="small" />
        </IconButton>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default UserRow;
