import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share } from "../../../../api/dashboard";
import { NoWrapTypography } from "../../../Common/StyledComponents";
import TimeBadge from "../../../Common/TimeBadge";
import UserAvatar from "../../../Common/User/UserAvatar";
import FileTypeIcon from "../../../FileManager/Explorer/FileTypeIcon";
import SettingForm from "../../../Pages/Setting/SettingForm";
import FileDialog from "../../File/FileDialog/FileDialog";
import UserDialog from "../../User/UserDialog/UserDialog";

const ShareForm = ({ values }: { values: Share }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogID, setFileDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values?.share.owner_id ?? 0);
  };

  const fileClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setFileDialogOpen(true);
    setFileDialogID(values?.share.file?.id ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <FileDialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} fileID={fileDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("file.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.share.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.shareLink")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <Link href={values.share_link} target="_blank" underline="hover" sx={{ wordBreak: "break-all" }}>
                {values.share_link}
              </Link>
            </Typography>
          </SettingForm>
          <SettingForm title={t("file.creator")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.share.owner_id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.views")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.share.views ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.downloads")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.share.downloads ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.srcFileName")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values?.share.file ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FileTypeIcon name={values?.share.file?.name ?? ""} fileType={values.share?.file?.type ?? 0} />
                  <NoWrapTypography variant="inherit">
                    <Link href={`#/`} onClick={fileClicked} underline="hover">
                      {values?.share.file?.name}
                    </Link>
                  </NoWrapTypography>
                </Box>
              ) : (
                <em>{t("share.deleted")}</em>
              )}
            </Typography>
          </SettingForm>
          <SettingForm title={t("share.createdAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.share.created_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default ShareForm;
