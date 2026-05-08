import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { Entity } from "../../../../api/dashboard";
import { EntityType } from "../../../../api/explorer";
import { useAppDispatch } from "../../../../redux/hooks";
import { sizeToString } from "../../../../util";
import { NoWrapTypography } from "../../../Common/StyledComponents";
import UserAvatar from "../../../Common/User/UserAvatar";
import { EntityTypeText } from "../../../FileManager/Sidebar/Data";
import SettingForm from "../../../Pages/Setting/SettingForm";
import UserDialog from "../../User/UserDialog/UserDialog";
import EntityFileList from "./EntityFileList";
const EntityForm = ({ values }: { values: Entity }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values?.entity.created_by ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("file.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.entity.id}
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.size")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {sizeToString(values.entity.size ?? 0)}
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.blobType")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {t(EntityTypeText[values.entity.type ?? EntityType.version])}
            </Typography>
          </SettingForm>
          <SettingForm title={t("entity.refenenceCount")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.entity.reference_count ?? 0}
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.creator")} noContainer lgWidth={4}>
            <NoWrapTypography variant={"body2"} color={"textSecondary"}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UserAvatar
                  sx={{ width: 24, height: 24 }}
                  overwriteTextSize
                  user={{
                    id: values?.user_hash_id ?? "",
                    nickname: "",
                    created_at: "",
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
                    {values?.entity.created_by}
                  </Link>
                </NoWrapTypography>
              </Box>
            </NoWrapTypography>
          </SettingForm>
          <SettingForm title={t("entity.uploadSessionID")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"} sx={{ wordBreak: "break-all" }}>
              {values.entity.upload_session_id ?? "-"}
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.source")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"} sx={{ wordBreak: "break-all" }}>
              {values.entity.source ?? "-"}
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.storagePolicy")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <Link
                component={RouterLink}
                underline="hover"
                to={`/admin/policy/${values.entity.storage_policy?.id}`}
                target="_blank"
              >
                {values.entity.storage_policy?.name}
              </Link>
            </Typography>
          </SettingForm>
          <SettingForm title={t("entity.referredFiles")} noContainer lgWidth={12}>
            <EntityFileList files={values.entity.file ?? []} userHashIDMap={values.user_hash_id_map ?? {}} />
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default EntityForm;
