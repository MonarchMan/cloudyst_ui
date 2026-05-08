import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { AiChatMessage } from "../../../../../api/dashboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NoWrapTypography } from "../../../../Common/StyledComponents";
import TimeBadge from "../../../../Common/TimeBadge";
import UserAvatar from "../../../../Common/User/UserAvatar";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import UserDialog from "../../../User/UserDialog/UserDialog";
import ChatConversationDialog from "../../ChatConversation/ChatConversationDialog/ChatConversationDialog";

const ChatMessageForm =({ values }: { values: AiChatMessage}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [conversationDialogID, setConversationDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values.message.user_id ?? 0);
  };

  const conversationClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setConversationDialogOpen(true);
    setConversationDialogID(values.message.conversation_id ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <ChatConversationDialog open={conversationDialogOpen} onClose={() => setConversationDialogOpen(false)} conversationID={conversationDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("message.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.conversation")} noContainer lgWidth={4}>
              <NoWrapTypography variant={"body2"} color={"textSecondary"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NoWrapTypography variant="inherit">
                    <Link href={`#/`} onClick={conversationClicked} underline="hover">
                      {values.message.conversation_id ?? 0}
                    </Link>
                  </NoWrapTypography>
                </Box>
              </NoWrapTypography>
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

          <SettingForm title={t("message.type")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.type}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.roleID")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.role_id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.model")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.model}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.content")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.content}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.reasonContent")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.reason_content}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.segmentIDs")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.segment_ids}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.attachmentUrls")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.message.attachment_urls}
            </Typography>
          </SettingForm>

          <SettingForm title={t("message.createdAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.message.created_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default ChatMessageForm;