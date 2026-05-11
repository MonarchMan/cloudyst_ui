import { Box, Collapse, SvgIconProps } from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon/SvgIcon";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import CaretDown from "../../Icons/CaretDown.tsx";
import CaretRight from "../../Icons/CaretRight.tsx";
import NavIconTransition from "./NavIconTransition.tsx";
import SideNavItem from "./SideNavItem.tsx";

export interface NavigationItem {
  label: string;
  icon?: readonly ((props: SvgIconProps) => JSX.Element)[] | readonly (typeof SvgIcon)[];
  iconifyName?: string;
  path: string;
  pro?: boolean;
  level?: number;
  children?: readonly NavigationItem[];
}

interface CollapsibleNavigationGroupProps {
  item: NavigationItem;
  renderChild: (item: NavigationItem) => JSX.Element;
}

const CollapsibleNavigationGroup = memo(({ item, renderChild }: CollapsibleNavigationGroupProps) => {
  const { t } = useTranslation("application");
  const location = useLocation();
  const [expanded, setExpanded] = useState(location.pathname.startsWith(item.path));
  const active = location.pathname == item.path || location.pathname.startsWith(item.path + "/");

  useEffect(() => {
    if (active) {
      setExpanded(true);
    }
  }, [active]);

  return (
    <Box>
      <SideNavItem
        onClick={() => setExpanded((value) => !value)}
        label={
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <Box component="span">{t(item.label)}</Box>
            {expanded ? <CaretDown fontSize="small" color="action" /> : <CaretRight fontSize="small" color="action" />}
          </Box>
        }
        active={active}
        icon={
          item.icon && (
            <NavIconTransition
              sx={{ px: 0, py: 0, pr: "14px", height: "20px" }}
              iconProps={{ fontSize: "small", color: "action" }}
              fileIcon={item.icon}
              active={active}
            />
          )
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box>{item.children?.map((child) => renderChild(child))}</Box>
      </Collapse>
    </Box>
  );
});

export default CollapsibleNavigationGroup;
