import { Box, Button, FormControl, ListItemText, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField, DenseSelect } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";

export interface ApiKeyFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  platform: string;
  setPlatform: (name: string) => void;
  status: number;
  setStatus: (status: number) => void;
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
    setLocalStatus(status);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setName("");
    setPlatform("");
    setLocalStatus(0);
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