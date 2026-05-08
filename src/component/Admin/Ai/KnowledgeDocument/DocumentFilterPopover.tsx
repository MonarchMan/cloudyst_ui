import { Popover, Stack, FormControl, ListItemText, Box, Button, PopoverProps } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField, DenseSelect } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface DocumentFilterPopoverProps extends PopoverProps {
  name: string;
  setName: (name: string) => void;
  knowledge: string;
  setKnowledge: (kowledgeID: string) => void;
  status: number;
  setStatus: (status: number) => void;
  clearFilters: () => void;
}

const DocumentFilterPopover = ({
  name,
  setName,
  knowledge,
  setKnowledge,
  status,
  setStatus,
  clearFilters,
  onClose,
  open,
  ...rest
}: DocumentFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localName, setLocalName] = useState(name);
  const [localKnowledge, setLocalKnowledge] = useState(knowledge);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    if(open) {
      setLocalName(name);
      setLocalKnowledge(knowledge);
      setLocalStatus(status);
    }
  }, [open]);
  
  // Apply filters and close popover
  const handleApplyFilters = () => {
    setName(localName);
    setKnowledge(localKnowledge);
    setLocalStatus(status);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setName("");
    setKnowledge("");
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
        <SettingForm title={t("document.name")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("document.knowledge")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localKnowledge}
            onChange={(e) => setLocalKnowledge(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
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

export default DocumentFilterPopover;