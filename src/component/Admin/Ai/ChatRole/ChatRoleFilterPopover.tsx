import { Popover, Stack, FormControl, Box, Button, PopoverProps, FormControlLabel, Switch } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface ChatRoleFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  publicStatus: string;
  setPublicStatus: (status: string) => void;
  category: string;
  setCategory: (category: string) => void;
  clearFilters: () => void;
}

const ChatRoleFilterPopover = ({
  name,
  setName,
  userId,
  setUserId,
  publicStatus,
  setPublicStatus,
  category,
  setCategory,
  clearFilters,
  onClose,
  open,
  ...rest
}: ChatRoleFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localName, setLocalName] = useState(name);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localPublicStatus, setLocalPublicStatus] = useState(publicStatus);
  const [localCategory, setLocalCategory] = useState(category);

  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalUserId(userId);
      setLocalPublicStatus(publicStatus);
      setLocalCategory(category);
    }
  }, [open, name, userId, publicStatus, category]);

  const handleApplyFilters = () => {
    setName(localName);
    setUserId(localUserId);
    setPublicStatus(localPublicStatus);
    setCategory(localCategory);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setName("");
    setUserId("");
    setPublicStatus("");
    setCategory("");
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
        <SettingForm title={t("role.name")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("role.userId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("role.publicStatus")} noContainer lgWidth={12}>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={localPublicStatus === "true"}
                  onChange={(e) => setLocalPublicStatus(e.target.checked ? "true" : "")}
                />
              }
              label={t("role.publicStatus")}
            />
          </FormControl>
        </SettingForm>

        <SettingForm title={t("role.category")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
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

export default ChatRoleFilterPopover;
