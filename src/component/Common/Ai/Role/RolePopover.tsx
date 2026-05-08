import { Box, Chip, Collapse, IconButton, PopoverProps, Tooltip, Typography } from "@mui/material";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiChatRole } from "../../../../api/dashboard.ts";
import RoleAvatar from "./RoleAvatar.tsx";
import UserBadge from "../../User/UserBadge.tsx";
import LockClosed from "../../../Icons/LockClosed.tsx";
import ArrowDown from "../../../Icons/ArrowDown.tsx";

interface RolePopoverProps extends PopoverProps {
  chatRole: AiChatRole;
}

export const RoleProfile = ({
  chatRole,
  displayOnly,
}: {
  chatRole: AiChatRole;
  displayOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { role, owner_info } = chatRole;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <RoleAvatar overwriteTextSize role={role} sx={{ width: 80, height: 80 }} />
        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant={"h6"} fontWeight={600} noWrap>
              {role.name ?? ""}
            </Typography>
            {role.category && <Chip size="small" label={role.category} />}
            {!role.public_status && (
              <Tooltip title="Private">
                <LockClosed sx={{ fontSize: 16, color: "text.secondary" }} />
              </Tooltip>
            )}
          </Box>
          {role.description && (
            <Typography variant={"body2"} color={"text.secondary"} sx={{ mt: 0.5 }}>
              {role.description}
            </Typography>
          )}
          {!displayOnly && owner_info && (
            <Box sx={{ mt: 1 }}>
              <UserBadge
                user={owner_info}
                uid={owner_info.id}
                textProps={{ variant: "body2", color: "text.secondary" }}
              />
            </Box>
          )}
        </Box>
      </Box>
      {role.system_message && (
        <Box sx={{ mt: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {t("System Message")}
            </Typography>
            <IconButton size="small" sx={{ p: 0.5 }}>
              <ArrowDown
                sx={{
                  fontSize: 16,
                  color: "text.secondary",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: (theme) =>
                    theme.transitions.create("transform", {
                      duration: theme.transitions.duration.shortest,
                    }),
                }}
              />
            </IconButton>
          </Box>
          <Collapse in={expanded} unmountOnExit>
            <Box
              sx={{
                mt: 0.5,
                p: 1,
                bgcolor: (theme) => theme.palette.action.hover,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {role.system_message}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

const RolePopover = ({ chatRole, open, ...rest }: RolePopoverProps) => {
  const stopPropagation = useCallback((e: any) => e.stopPropagation(), []);
  const { PaperProps, ...popoverProps } = rest as any;
  return (
    <HoverPopover
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      onClick={stopPropagation}
      open={open}
      {...popoverProps}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <Box sx={{ minWidth: "300px", p: 2 }}>
        <RoleProfile chatRole={chatRole} />
      </Box>
    </HoverPopover>
  );
};

export default RolePopover;
