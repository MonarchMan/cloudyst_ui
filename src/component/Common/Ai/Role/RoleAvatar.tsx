import { Avatar, Skeleton } from "@mui/material";
import { grey } from "@mui/material/colors";
import { bindHover, bindPopover } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { AiChatRole, AiChatRoleModel } from "../../../../api/dashboard.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { getChatRoleDetail } from "../../../../api/api.ts";
import Bot from "../../../Icons/Bot.tsx";
import RolePopover from "./RolePopover.tsx";

export interface RoleAvatarProps {
  role?: AiChatRoleModel;
  chatRole?: AiChatRole;
  rid?: number;
  overwriteTextSize?: boolean;
  onRoleLoaded?: (role: AiChatRoleModel) => void;
  enablePopover?: boolean;
  square?: boolean;
  [key: string]: any;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

const RoleAvatar = memo(
  ({
    role,
    chatRole,
    rid,
    key,
    overwriteTextSize,
    onRoleLoaded,
    sx,
    square,
    enablePopover,
    ...rest
  }: RoleAvatarProps) => {
    const [loadedRole, setLoadedRole] = useState<AiChatRoleModel | undefined>(undefined);
    const [loadedChatRole, setLoadedChatRole] = useState<AiChatRole | undefined>(undefined);
    const dispatch = useAppDispatch();
    const popupState = usePopupState({
      variant: "popover",
      popupId: "role",
    });
    const { ref, inView } = useInView({
      triggerOnce: true,
      rootMargin: "200px 0px",
      skip: !!role || !rid,
    });

    useEffect(() => {
      if (inView && !loadedRole && rid) {
        loadRole(rid);
      }
    }, [inView]);

    useEffect(() => {
      if (role) {
        setLoadedRole(role);
      }
    }, [role]);

    const loadRole = useCallback(
      async (rid: number) => {
        try {
          const res = await dispatch(getChatRoleDetail(rid));
          setLoadedRole(res.role);
          setLoadedChatRole(res);
          if (onRoleLoaded) {
            onRoleLoaded(res.role);
          }
        } catch (e) {
          console.warn("Failed to load role info", e);
        }
      },
      [dispatch, onRoleLoaded],
    );

    const displayRole = loadedRole ?? role;
    const displayChatRole = loadedChatRole ?? chatRole;

    const avatarUrl = useMemo(() => {
      if (displayRole?.avatar) {
        return displayRole.avatar;
      }
      return undefined;
    }, [displayRole]);

    return (
      <>
        {displayRole && (
          <>
            <Avatar
              alt={displayRole.name ?? ""}
              src={avatarUrl}
              slotProps={{
                img: {
                  loading: "lazy",
                  alt: "",
                },
              }}
              {...rest}
              {...bindHover(popupState)}
              sx={[
                {
                  bgcolor: displayRole.name ? stringToColor(displayRole.name) : grey[500],
                  ...sx,
                },
                overwriteTextSize && {
                  fontSize: `${sx.width * 0.6}px!important`,
                },
                square && {
                  borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                },
              ]}
            >
              {!avatarUrl && (displayRole.name ? displayRole.name.charAt(0).toUpperCase() : <Bot />)}
            </Avatar>
            {enablePopover && displayChatRole && (
              <RolePopover chatRole={displayChatRole} {...bindPopover(popupState)} />
            )}
          </>
        )}
        {!displayRole && <Skeleton ref={ref} variant={"circular"} sx={{ ...sx }} {...rest} />}
      </>
    );
  },
);

export default RoleAvatar;
