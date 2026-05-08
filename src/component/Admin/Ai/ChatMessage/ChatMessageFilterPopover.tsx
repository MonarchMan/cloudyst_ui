import { Popover, Stack, Box, Button, PopoverProps } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface ChatMessageFilterPopoverProps extends PopoverProps {
  conversationId: string;
  setConversationId: (id: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  roleId: string;
  setRoleId: (id: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
  type: string;
  setType: (type: string) => void;
  clearFilters: () => void;
}

const ChatMessageFilterPopover = ({
  conversationId,
  setConversationId,
  userId,
  setUserId,
  roleId,
  setRoleId,
  modelId,
  setModelId,
  type,
  setType,
  clearFilters,
  onClose,
  open,
  ...rest
}: ChatMessageFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localConversationId, setLocalConversationId] = useState(conversationId);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localRoleId, setLocalRoleId] = useState(roleId);
  const [localModelId, setLocalModelId] = useState(modelId);
  const [localType, setLocalType] = useState(type);

  useEffect(() => {
    if (open) {
      setLocalConversationId(conversationId);
      setLocalUserId(userId);
      setLocalRoleId(roleId);
      setLocalModelId(modelId);
      setLocalType(type);
    }
  }, [open, conversationId, userId, roleId, modelId, type]);

  const handleApplyFilters = () => {
    setConversationId(localConversationId);
    setUserId(localUserId);
    setRoleId(localRoleId);
    setModelId(localModelId);
    setType(localType);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setConversationId("");
    setUserId("");
    setRoleId("");
    setModelId("");
    setType("");
    onClose?.({}, "backdropClick");
  };

  return (
    <Popover
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            widows: 300,
            maxWidth: "100%",
          },
        },
      }}
      onClose={onClose}
      open={open}
      {...rest}
    >
      <Stack spacing={2}>
        <SettingForm title={t("message.conversationId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localConversationId}
            onChange={(e) => setLocalConversationId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("message.userId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("message.roleId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localRoleId}
            onChange={(e) => setLocalRoleId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("message.modelId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localModelId}
            onChange={(e) => setLocalModelId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("message.type")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localType}
            onChange={(e) => setLocalType(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            {t("document.reset")}
          </Button>
          <Button variant="contained" size="small" onClick={handleApplyFilters}>
            {t("document.apply")}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};

export default ChatMessageFilterPopover;
