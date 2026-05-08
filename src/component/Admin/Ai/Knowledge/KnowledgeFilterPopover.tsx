import { Box, Button, Checkbox, FormControl, ListItemText, Popover, PopoverProps, Stack, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField, DenseSelect, SmallFormControlLabel } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface KnowledgeFilterPopoverProps extends PopoverProps {
  name: string,
  setName: (name: string) => void;
  status: number,
  setStatus: (status: number) => void;
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
    setLocalName("");
    setLocalStatus(0);
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
          <FormControl fullWidth>
            <DenseSelect
              value={localStatus === undefined ? 0 : localStatus}
              onChange={(e) => setLocalStatus(Number(e.target.value))}
            >
              <SquareMenuItem value={0}>
                <ListItemText slotProps={{ primary: { variant: "body2" } }}>
                  <em>{t("common.all")}</em>
                </ListItemText>
              </SquareMenuItem>
              <SquareMenuItem value={1}>
                <ListItemText slotProps={{ primary: {variant: "body2" }}}>
                  {t("common.status_active")}
                </ListItemText>
              </SquareMenuItem>
              <SquareMenuItem value={2}>
                <ListItemText slotProps={{ primary: {variant: "body2" }}}>
                  {t("common.status_inactive")}
                </ListItemText>
              </SquareMenuItem>
            </DenseSelect>
          </FormControl>
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