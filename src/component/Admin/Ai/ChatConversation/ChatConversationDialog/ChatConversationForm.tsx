import { useMediaQuery, Box, Grid2 as Grid, Typography, useTheme, FormControl, FormControlLabel, Switch, Link } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiChatConversation } from "../../../../../api/dashboard";
import { NoWrapTypography } from "../../../../Common/StyledComponents";
import TimeBadge from "../../../../Common/TimeBadge";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { NoMarginHelperText } from "../../../Settings/Settings";
import UserDialog from "../../../User/UserDialog/UserDialog";
import UserAvatar from "../../../../Common/User/UserAvatar";

const ChatConversationForm =({ values }: { values: AiChatConversation}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values.conversation.user_id ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("conversation.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("conversation.title")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.title}
            </Typography>
          </SettingForm>
          
          <SettingForm lgWidth={5}>
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.conversation.pinned}
                  />
                }
                label={t("conversation.pinned")}
              />
              <NoMarginHelperText>{t("conversation.pinned")}</NoMarginHelperText>
            </FormControl>
          </SettingForm>

          <SettingForm title={t("knowledge.owner")} noContainer lgWidth={4}>
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

          <SettingForm title={t("conversation.roleID")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.role_id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("conversation.systemMessage")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.system_message}
            </Typography>
          </SettingForm>

          <SettingForm title={t("conversation.model")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.model}
            </Typography>
          </SettingForm>
          <SettingForm title={t("conversation.temperature")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.temperature}
            </Typography>
          </SettingForm>
          <SettingForm title={t("conversation.model")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.conversation.max_contexts}
            </Typography>
          </SettingForm>

          <SettingForm title={t("conversation.createdAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.conversation.created_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default ChatConversationForm;