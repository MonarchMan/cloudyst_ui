import { Box, Button, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { AiStatusSelect } from "../AiSelects";
import { AiStatusFilterValue } from "../constants";

export interface ModelFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  model: string;
  setModel: (model: string) => void;
  platform: string;
  setPlatform: (platform: string) => void;
  status: AiStatusFilterValue;
  setStatus: (status: AiStatusFilterValue) => void;
  clearFilters: () => void;
}

const ModelFilterPopover = ({
  name,
  setName,
  model,
  setModel,
  platform,
  setPlatform,
  status,
  setStatus,
  onClose,
  open,
  ...rest
}: ModelFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");
  const [localName, setLocalName] = useState(name);
  const [localModel, setLocalModel] = useState(model);
  const [localPlatform, setLocalPlatform] = useState(platform);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalModel(model);
      setLocalPlatform(platform);
      setLocalStatus(status);
    }
  }, [model, name, open, platform, status]);

  const handleApplyFilters = () => {
    setName(localName);
    setModel(localModel);
    setPlatform(localPlatform);
    setStatus(localStatus);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setName("");
    setModel("");
    setPlatform("");
    setStatus("");
    setLocalName("");
    setLocalModel("");
    setLocalPlatform("");
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
            width: 320,
            maxWidth: "100%",
          },
        },
      }}
      onClose={onClose}
      open={open}
      {...rest}
    >
      <Stack spacing={2}>
        <SettingForm title={t("model.name")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("apikey.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("model.model")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
            placeholder={t("apikey.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("model.platform")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localPlatform}
            onChange={(e) => setLocalPlatform(e.target.value)}
            placeholder={t("apikey.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("common.status")} noContainer lgWidth={12}>
          <AiStatusSelect includeAll value={localStatus} onChange={setLocalStatus} />
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

export default ModelFilterPopover;
