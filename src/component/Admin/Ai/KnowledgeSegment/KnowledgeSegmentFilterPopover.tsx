import { Popover, Stack, FormControl, Box, Button, PopoverProps } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import SettingForm from "../../../Pages/Setting/SettingForm";

export interface KnowledgeSegmentFilterPopoverProps extends PopoverProps {
  documentId: string;
  setDocumentId: (id: string) => void;
  knowledgeId: string;
  setKnowledgeId: (id: string) => void;
  clearFilters: () => void;
}

const KnowledgeSegmentFilterPopover = ({
  documentId,
  setDocumentId,
  knowledgeId,
  setKnowledgeId,
  clearFilters,
  onClose,
  open,
  ...rest
}: KnowledgeSegmentFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  const [localDocumentId, setLocalDocumentId] = useState(documentId);
  const [localKnowledgeId, setLocalKnowledgeId] = useState(knowledgeId);

  useEffect(() => {
    if (open) {
      setLocalDocumentId(documentId);
      setLocalKnowledgeId(knowledgeId);
    }
  }, [open, documentId, knowledgeId]);

  const handleApplyFilters = () => {
    setDocumentId(localDocumentId);
    setKnowledgeId(localKnowledgeId);
    onClose?.({}, "backdropClick");
  };

  const handleResetFilters = () => {
    setDocumentId("");
    setKnowledgeId("");
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
        <SettingForm title={t("segment.documentId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localDocumentId}
            onChange={(e) => setLocalDocumentId(e.target.value)}
            placeholder={t("document.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("segment.knowledgeId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localKnowledgeId}
            onChange={(e) => setLocalKnowledgeId(e.target.value)}
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

export default KnowledgeSegmentFilterPopover;
