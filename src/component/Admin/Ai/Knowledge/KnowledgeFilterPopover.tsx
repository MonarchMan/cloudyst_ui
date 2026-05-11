import { Box, Button, Checkbox, Popover, PopoverProps, Stack, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField, SmallFormControlLabel } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { AiStatusSelect } from "../AiSelects";
import { AiStatusFilterValue } from "../constants";

export interface KnowledgeFilterPopoverProps extends PopoverProps {
  name: string,
  setName: (name: string) => void;
  status: AiStatusFilterValue,
  setStatus: (status: AiStatusFilterValue) => void;
  isPublic: boolean,
  setIsPublic: (isPublic: boolean) => void;
  isMaster: boolean,
  setIsMaster: (isMaster: boolean) => void;
  clearFilters: () => void;
}

const StyledCheckbox = styled(Checkbox)(() => ({
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
}));

const KnowledgeFilterPopover = ({
  name,
  setName,
  status,
  setStatus,
  isPublic,
  setIsPublic,
  isMaster,
  setIsMaster,
  clearFilters,
  onClose,
  open,
  ...rest
}: KnowledgeFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localName, setLocalName] = useState(name);
  const [localStatus, setLocalStatus] = useState(status);
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);
  const [localIsMaster, setLocalIsMaster] = useState(isMaster);

  // Initialize local state when popup opens
  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalStatus(status);
      setLocalIsPublic(isPublic)
      setLocalIsMaster(isMaster);
    }
  }, [open]);

  // Apply filters and close popover
  const handleApplyFilters = () => {
    setName(localName);
    setStatus(localStatus);
    setIsPublic(localIsPublic);
    setIsMaster(localIsMaster);
    onClose?.({}, "backdropClick");
  };
  
  // Reset filters and close popover
  const handleResetFilters = () => {
    setName("");
    setStatus("");
    setIsPublic(false);
    setIsMaster(false);
    setLocalName("");
    setLocalStatus("");
    setLocalIsPublic(false);
    setLocalIsMaster(false);
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
            width: 300,
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

        <SettingForm title={t("common.status")} noContainer lgWidth={12}>
          <AiStatusSelect includeAll value={localStatus ?? ""} onChange={setLocalStatus} />
        </SettingForm>

        <SettingForm title={t("knowledge.otherConfitions")} noContainer lgWidth={12}>
          <Stack spacing={0.5}>
            <SmallFormControlLabel
              control={
                <StyledCheckbox
                  disableRipple
                  size="small"
                  checked={localIsPublic}
                  onChange={(e) => setLocalIsPublic(e.target.checked)}
                />
              }
              label={t("knowledge.isPublic")}
            />
            <SmallFormControlLabel
              control={
                <StyledCheckbox
                  disableRipple
                  size="small"
                  checked={localIsMaster}
                  onChange={(e) => setLocalIsMaster(e.target.checked)}
                />
              }
              label={t("knowledge.isMaster")}
            />
          </Stack>
        </SettingForm>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            {t("knowledge.reset")}
          </Button>
          <Button variant="contained" size="small" onClick={handleApplyFilters}>
            {t("knowledge.apply")}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};

export default KnowledgeFilterPopover;
