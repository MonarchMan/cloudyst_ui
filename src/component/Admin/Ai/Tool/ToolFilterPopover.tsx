import { Popover, Stack, Box, Button, PopoverProps } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface ToolFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  type: string;
  setType: (type: string) => void;
  clearFilters: () => void;
}

const ToolFilterPopover = ({
  name,
  setName,
  type,
  setType,
  clearFilters,
  onClose,
  open,
  ...rest
}: ToolFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localName, setLocalName] = useState(name);
  const [localType, setLocalType] = useState(type);

  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalType(type);
    }
  }, [open, name, type]);

  const handleApplyFilters = () => {
    setName(localName);
    setType(localType);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setName("");
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
        <SettingForm title={t("tool.name")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("tool.type")} noContainer lgWidth={12}>
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

export default ToolFilterPopover;
