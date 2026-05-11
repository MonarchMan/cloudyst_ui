import { Icon as Iconify } from "@iconify/react";
import { Box, useTheme } from "@mui/material";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { GroupPermission } from "../../../api/user.ts";
import { useAppSelector } from "../../../redux/hooks.ts";
import SessionManager from "../../../session";
import { GroupBS } from "../../../session/utils.ts";
import ProDialog from "../../Admin/Common/ProDialog.tsx";
import { AdminAiNavigationItem } from "../../Admin/Ai/constants.tsx";
import { AiAssistantNavigationItem } from "../../Pages/Ai/constants.tsx";
import BoxMultiple from "../../Icons/BoxMultiple.tsx";
import BoxMultipleFilled from "../../Icons/BoxMultipleFilled.tsx";
import CloudDownload from "../../Icons/CloudDownload.tsx";
import CloudDownloadOutlined from "../../Icons/CloudDownloadOutlined.tsx";
import CubeSync from "../../Icons/CubeSync.tsx";
import CubeSyncFilled from "../../Icons/CubeSyncFilled.tsx";
import CubeTree from "../../Icons/CubeTree.tsx";
import CubeTreeFilled from "../../Icons/CubeTreeFilled.tsx";
import DataHistogram from "../../Icons/DataHistogram.tsx";
import DataHistogramFilled from "../../Icons/DataHistogramFilled.tsx";
import Folder from "../../Icons/Folder.tsx";
import FolderOutlined from "../../Icons/FolderOutlined.tsx";
import HomeOutlined from "../../Icons/HomeOutlined.tsx";
import Payment from "../../Icons/Payment.tsx";
import PaymentFilled from "../../Icons/PaymentFilled.tsx";
import People from "../../Icons/People.tsx";
import PeopleFilled from "../../Icons/PeopleFilled.tsx";
import Person from "../../Icons/Person.tsx";
import PersonOutlined from "../../Icons/PersonOutlined.tsx";
import PhoneLaptop from "../../Icons/PhoneLaptop.tsx";
import PhoneLaptopOutlined from "../../Icons/PhoneLaptopOutlined.tsx";
import SendLogging from "../../Icons/SendLogging.tsx";
import SendLoggingFilled from "../../Icons/SendLoggingFilled.tsx";
import Server from "../../Icons/Server.tsx";
import ServerFilled from "../../Icons/ServerFilled.tsx";
import Setting from "../../Icons/Setting.tsx";
import SettingsOutlined from "../../Icons/SettingsOutlined.tsx";
import ShareAndroid from "../../Icons/ShareAndroid.tsx";
import ShareOutlined from "../../Icons/ShareOutlined.tsx";
import Storage from "../../Icons/Storage.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import Warning from "../../Icons/Warning.tsx";
import WarningOutlined from "../../Icons/WarningOutlined.tsx";
import WrenchSettings from "../../Icons/WrenchSettings.tsx";
import { ProChip } from "../../Pages/Setting/SettingForm.tsx";
import CollapsibleNavigationGroup, { NavigationItem } from "./CollapsibleNavigationGroup.tsx";
import NavIconTransition from "./NavIconTransition.tsx";
import SideNavItem from "./SideNavItem.tsx";

let NavigationItems: NavigationItem[];
NavigationItems = [
  {
    label: "navbar.myShare",
    icon: [ShareAndroid, ShareOutlined],
    path: "/shares",
  },
];

const ConnectNavigationItem: NavigationItem = {
  label: "navbar.connect",
  icon: [PhoneLaptop, PhoneLaptopOutlined],
  path: "/connect",
};

const TaskNavigationItem: NavigationItem = {
  label: "navbar.taskQueue",
  icon: [CubeSyncFilled, CubeSync],
  path: "/tasks",
};

const RemoteDownloadNavigationItem: NavigationItem = {
  label: "navbar.remoteDownload",
  icon: [CloudDownload, CloudDownloadOutlined],
  path: "/downloads",
};

export const SideNavItemComponent = ({ item }: { item: NavigationItem }) => {
  const { t } = useTranslation("application");
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [proOpen, setProOpen] = useState(false);
  const active = useMemo(() => {
    return location.pathname == item.path || location.pathname.startsWith(item.path + "/");
  }, [location.pathname, item.path]);
  return (
    <>
      {item.pro && <ProDialog open={proOpen} onClose={() => setProOpen(false)} />}
      <SideNavItem
        key={item.label}
        onClick={() =>
          item.pro ? setProOpen(true) : item.iconifyName ? window.open(item.path, "_blank") : navigate(item.path)
        }
        label={
          item.pro ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {t(item.label)}
              <ProChip
                sx={{
                  height: "16px",
                  fontSize: (t) => t.typography.caption.fontSize,
                }}
                label="Pro"
                color="primary"
                size="small"
              />
            </Box>
          ) : (
            t(item.label)
          )
        }
        active={active}
        level={item.level}
        icon={
          !item.icon ? (
            <Box
              sx={{
                width: 20,
                height: 20,
              }}
            >
              {item.iconifyName && (
                <Iconify
                  icon={item.iconifyName}
                  height={20}
                  style={{
                    color: theme.palette.action.active,
                  }}
                />
              )}
            </Box>
          ) : (
            <NavIconTransition
              sx={{ px: 0, py: 0, pr: "14px", height: "20px" }}
              iconProps={{ fontSize: "small", color: "action" }}
              fileIcon={item.icon}
              active={active}
            />
          )
        }
      />
    </>
  );
};

let AdminNavigationItems: NavigationItem[];
AdminNavigationItems = [
  {
    label: "dashboard:nav.summary",
    icon: [DataHistogramFilled, DataHistogram],
    path: "/admin/home",
  },
  {
    label: "dashboard:nav.settings",
    icon: [Setting, SettingsOutlined],
    path: "/admin/settings",
  },
  {
    label: "dashboard:nav.fileSystem",
    icon: [CubeTreeFilled, CubeTree],
    path: "/admin/filesystem",
  },
  {
    label: "dashboard:nav.storagePolicy",
    icon: [Storage, StorageOutlined],
    path: "/admin/policy",
  },
  {
    label: "dashboard:nav.nodes",
    icon: [ServerFilled, Server],
    path: "/admin/node",
  },
  {
    label: "dashboard:nav.groups",
    icon: [PeopleFilled, People],
    path: "/admin/group",
  },
  {
    label: "dashboard:nav.users",
    icon: [Person, PersonOutlined],
    path: "/admin/user",
  },
  {
    label: "dashboard:nav.files",
    icon: [Folder, FolderOutlined],
    path: "/admin/file",
  },
  {
    label: "dashboard:nav.entities",
    icon: [BoxMultipleFilled, BoxMultiple],
    path: "/admin/blob",
  },
  {
    label: "dashboard:nav.shares",
    icon: [ShareAndroid, ShareOutlined],
    path: "/admin/share",
  },
  {
    label: "dashboard:nav.tasks",
    icon: [CubeSyncFilled, CubeSync],
    path: "/admin/task",
  },
  {
    label: "dashboard:vas.orders",
    icon: [PaymentFilled, Payment],
    path: "/admin/payment",
    pro: true,
  },
  {
    label: "dashboard:nav.events",
    icon: [SendLoggingFilled, SendLogging],
    path: "/admin/event",
    pro: true,
  },
  {
    label: "dashboard:nav.abuseReport",
    icon: [Warning, WarningOutlined],
    path: "/admin/abuse",
    pro: true,
  },
];

const AdminAiNavigationGroup = memo(() => {
  return <CollapsibleNavigationGroup item={AdminAiNavigationItem} renderChild={(item) => <SideNavItemComponent key={item.label} item={item} />} />;
});

export const AdminPageNavigation = memo(() => {
  return (
    <>
      <SideNavItemComponent key={AdminNavigationItems[0].label} item={AdminNavigationItems[0]} />
      <Box>
        <AdminAiNavigationGroup />
        {AdminNavigationItems.slice(1).map((item) => (
          <SideNavItemComponent key={item.label} item={item} />
        ))}
      </Box>
      <SideNavItemComponent
        item={{
          label: "navbar.backToHomepage",
          icon: [HomeOutlined, HomeOutlined],
          path: "/home",
        }}
      />
    </>
  );
});

const PageNavigation = () => {
  const appPromotionEnabled = useAppSelector((state) => state.siteConfig.basic.config.app_promotion);
  const user = SessionManager.currentLoginOrNull();
  const isAdmin = useMemo(() => {
    return GroupBS(user?.user).enabled(GroupPermission.is_admin);
  }, [user?.user?.group?.permissions]);
  const remoteDownloadEnabled = useMemo(() => {
    return GroupBS(user?.user).enabled(GroupPermission.remote_download);
  }, [user?.user?.group?.permissions]);
  const connectEnabled = useMemo(() => {
    return GroupBS(user?.user).enabled(GroupPermission.webdav) || appPromotionEnabled;
  }, [user?.user?.group?.permissions, appPromotionEnabled]);
  const isLogin = !!user;
  const customNavItems = useAppSelector((state) => state.siteConfig.basic.config.custom_nav_items);

  return (
    <>
      {isLogin && (
        <Box>
          <>
            <CollapsibleNavigationGroup item={AiAssistantNavigationItem} renderChild={(item) => <SideNavItemComponent key={item.label} item={item} />} />
            {NavigationItems.map((item) => (
              <SideNavItemComponent key={item.label} item={item} />
            ))}
            {connectEnabled && <SideNavItemComponent item={ConnectNavigationItem} />}
            <SideNavItemComponent item={TaskNavigationItem} />
            {remoteDownloadEnabled && <SideNavItemComponent item={RemoteDownloadNavigationItem} />}
          </>
        </Box>
      )}
      {customNavItems && customNavItems.length > 0 && (
        <Box>
          {customNavItems.map((item) => (
            <SideNavItemComponent
              key={item.name}
              item={{
                label: item.name,
                iconifyName: item.icon,
                path: item.url,
              }}
            />
          ))}
        </Box>
      )}
      {isLogin && isAdmin && (
        <SideNavItemComponent
          item={{
            label: "navbar.dashboard",
            icon: [WrenchSettings, WrenchSettings],
            path: "/admin/home",
          }}
        />
      )}
    </>
  );
};

export default PageNavigation;
