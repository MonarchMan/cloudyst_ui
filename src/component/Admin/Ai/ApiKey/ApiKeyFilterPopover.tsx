import { Box, Button, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import { AiStatusSelect } from "../AiSelects";
import { AiStatusFilterValue } from "../constants";

export interface ApiKeyFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  platform: string;
  setPlatform: (name: string) => void;
  status: AiStatusFilterValue;
  setStatus: (status: AiStatusFilterValue) => void;
  clearFilters: () => void;
}

const ApiKeyFilterPopover = ({
  name,
  setName,
  platform,
  setPlatform,
  status,
  setStatus,
  clearFilters,
  onClose,
  open,
  ...rest
}: ApiKeyFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localName, setLocalName] = useState(name);
  const [localPlatform, setLocalPlatform] = useState(platform);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    if(open) {
      setLocalName(name);
      setLocalPlatform(platform);
      setLocalStatus(status);
    }
  }, [open]);
  
  // Apply filters and close popover
  const handleApplyFilters = () => {
    setName(localName);
    setPlatform(localPlatform == " " ? "" : localPlatform);
    setStatus(localStatus);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setName("");
    setPlatform("");
    setStatus("");
    setLocalStatus("");
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
        <SettingForm title={t("apikey.name")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("apikey.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("apikey.platform")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localPlatform}
            onChange={(e) => setLocalPlatform(e.target.value)}
            placeholder={t("apikey.emptyNoFilter")}
            size="small"
          />
        </SettingForm>
        <SettingForm title={t("common.status")} noContainer lgWidth={12}>
          <AiStatusSelect includeAll value={localStatus ?? ""} onChange={setLocalStatus} />
        </SettingForm>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            {t("apikey.reset")}
          </Button>
          <Button variant="contained" size="small" onClick={handleApplyFilters}>
            {t("apikey.apply")}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};

export default ApiKeyFilterPopover;
