import RoleAvatar, { RoleAvatarProps } from "./RoleAvatar.tsx";
import { Skeleton, TypographyProps } from "@mui/material";
import { useState } from "react";
import { BadgeText, DefaultButton } from "../../StyledComponents.tsx";
import { usePopupState } from "material-ui-popup-state/hooks";
import RolePopover from "./RolePopover.tsx";
import { bindHover, bindPopover } from "material-ui-popup-state";
import { AiChatRole, AiChatRoleModel } from "../../../../api/dashboard.ts";

export interface RoleBadgeProps extends RoleAvatarProps {
  textProps?: TypographyProps;
  onClick?: () => void;
}

const RoleBadge = ({ textProps, role, chatRole, rid, onClick, ...rest }: RoleBadgeProps) => {
  const [roleLoaded, setRoleLoaded] = useState<AiChatRoleModel | undefined>(role);
  const popupState = usePopupState({
    variant: "popover",
    popupId: "role",
  });

  const displayChatRole: AiChatRole | undefined =
    chatRole ?? (roleLoaded ? ({ role: roleLoaded } as AiChatRole) : undefined);

  return (
    <>
      <DefaultButton
        {...bindHover(popupState)}
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          maxWidth: "150px",
        }}
      >
        <RoleAvatar
          overwriteTextSize
          role={role}
          chatRole={chatRole}
          rid={rid}
          onRoleLoaded={(r) => setRoleLoaded(r)}
          {...rest}
        />
        <BadgeText {...textProps}>
          {roleLoaded ? roleLoaded.name ?? "" : <Skeleton width={60} />}
        </BadgeText>
      </DefaultButton>
      {displayChatRole && <RolePopover chatRole={displayChatRole} {...bindPopover(popupState)} />}
    </>
  );
};

export default RoleBadge;
