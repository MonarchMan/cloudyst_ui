import { Popover, Stack, FormControl, Box, Button, PopoverProps } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface ImageFilterPopoverProps extends PopoverProps {
  platform: string;
  setPlatform: (platform: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  clearFilters: () => void;
}

const ImageFilterPopover = ({
  platform,
  setPlatform,
  modelId,
  setModelId,
  userId,
  setUserId,
  clearFilters,
  onClose,
  open,
  ...rest
}: ImageFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localPlatform, setLocalPlatform] = useState(platform);
  const [localModelId, setLocalModelId] = useState(modelId);
  const [localUserId, setLocalUserId] = useState(userId);

  useEffect(() => {
    if (open) {
      setLocalPlatform(platform);
      setLocalModelId(modelId);
      setLocalUserId(userId);
    }
  }, [open, platform, modelId, userId]);

  const handleApplyFilters = () => {
    setPlatform(localPlatform);
    setModelId(localModelId);
    setUserId(localUserId);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setPlatform("");
    setModelId("");
    setUserId("");
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
        <SettingForm title={t("image.platform")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localPlatform}
            onChange={(e) => setLocalPlatform(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("image.modelId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localModelId}
            onChange={(e) => setLocalModelId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("image.userId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
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

export default ImageFilterPopover;
