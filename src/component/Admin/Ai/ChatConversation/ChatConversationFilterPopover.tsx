import { Popover, Stack, FormControl, Box, Button, PopoverProps, FormControlLabel, Switch } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface ChatConversationFilterPopoverProps extends PopoverProps {
  title: string;
  setTitle: (title: string) => void;
  pinned: string;
  setPinned: (pinned: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  roleId: string;
  setRoleId: (id: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
  clearFilters: () => void;
}

const ChatConversationFilterPopover = ({
  title,
  setTitle,
  pinned,
  setPinned,
  userId,
  setUserId,
  roleId,
  setRoleId,
  modelId,
  setModelId,
  clearFilters,
  onClose,
  open,
  ...rest
}: ChatConversationFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localTitle, setLocalTitle] = useState(title);
  const [localPinned, setLocalPinned] = useState(pinned);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localRoleId, setLocalRoleId] = useState(roleId);
  const [localModelId, setLocalModelId] = useState(modelId);

  useEffect(() => {
    if (open) {
      setLocalTitle(title);
      setLocalPinned(pinned);
      setLocalUserId(userId);
      setLocalRoleId(roleId);
      setLocalModelId(modelId);
    }
  }, [open, title, pinned, userId, roleId, modelId]);

  const handleApplyFilters = () => {
    setTitle(localTitle);
    setPinned(localPinned);
    setUserId(localUserId);
    setRoleId(localRoleId);
    setModelId(localModelId);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setTitle("");
    setPinned("");
    setUserId("");
    setRoleId("");
    setModelId("");
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
        <SettingForm title={t("conversation.title")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("conversation.pinned")} noContainer lgWidth={12}>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={localPinned === "true"}
                  onChange={(e) => setLocalPinned(e.target.checked ? "true" : "")}
                />
              }
              label={t("conversation.pinned")}
            />
          </FormControl>
        </SettingForm>

        <SettingForm title={t("conversation.userId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("conversation.roleId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localRoleId}
            onChange={(e) => setLocalRoleId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("conversation.modelId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localModelId}
            onChange={(e) => setLocalModelId(e.target.value)}
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

export default ChatConversationFilterPopover;
