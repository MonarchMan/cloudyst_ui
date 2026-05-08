import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useTranslation } from "react-i18next";
import { AiImage } from "../../../../../api/dashboard";
import UserDialog from "../../../User/UserDialog/UserDialog";
import { useState } from "react";
import TimeBadge from "../../../../Common/TimeBadge";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { NoWrapTypography } from "../../../../Common/StyledComponents";
import UserAvatar from "../../../../Common/User/UserAvatar";

const ImageForm = ({ values }: { values: AiImage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values.image.user_id ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("image.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.platform")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <Link href={values.image.platform} target="_blank" underline="hover" sx={{ wordBreak: "break-all" }}>
                {values.image.platform}
              </Link>
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.model")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.model}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image  .owner")} noContainer lgWidth={4}>
              <NoWrapTypography variant={"body2"} color={"textSecondary"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <UserAvatar
                    sx={{ width: 24, height: 24 }}
                    overwriteTextSize
                    user={{
                      id: values.owner_info?.id ?? "",
                      nickname: values.owner_info?.nickname ?? "",
                      created_at: values.owner_info?.created_at ?? "",
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
                      {values.owner_info?.nickname ?? ""}
                    </Link>
                  </NoWrapTypography>
                </Box>
              </NoWrapTypography>
            </SettingForm>

          <SettingForm title={t("image.prompt")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.prompt}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.width")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.width ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.height")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.height ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.options")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.options ? JSON.stringify(values.image.options) : ""}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.picUrl")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.pic_url}
            </Typography>
          </SettingForm>

          <SettingForm title={t("image.status")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.image.status}
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.createdAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.image.created_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>

          <SettingForm title={t("share.updatedAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.image.updated_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default ImageForm;