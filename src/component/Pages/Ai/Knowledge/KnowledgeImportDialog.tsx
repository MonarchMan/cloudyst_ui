import { Box, DialogContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { GetKnowledgeResponse } from "../../../../api/ai.ts";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import FolderPicker from "../../../FileManager/FolderPicker.tsx";

interface KnowledgeImportDialogProps {
  open: boolean;
  loading: boolean;
  knowledges: GetKnowledgeResponse[];
  selectedKnowledgeId: string;
  selectedFileCount: number;
  onClose: () => void;
  onImport: () => void;
  onKnowledgeChange: (event: SelectChangeEvent<string>) => void;
}

const KnowledgeImportDialog = ({
  open,
  loading,
  knowledges,
  selectedKnowledgeId,
  selectedFileCount,
  onClose,
  onImport,
  onKnowledgeChange,
}: KnowledgeImportDialogProps) => {
  const { t } = useTranslation("application");

  return (
    <DraggableDialog
      title={t("ai.importFiles")}
      showActions
      showCancel
      loading={loading}
      disabled={!selectedKnowledgeId || selectedFileCount === 0}
      okText={t("ai.batchImportToKnowledge")}
      onAccept={onImport}
      dialogProps={{
        open,
        onClose,
        fullWidth: true,
        maxWidth: "lg",
        disableRestoreFocus: true,
        PaperProps: {
          sx: {
            height: "min(90vh, 920px)",
          },
        },
      }}
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 0 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 280 } }}>
            <InputLabel id="knowledge-import-select-label">{t("ai.selectKnowledgeBase")}</InputLabel>
            <Select
              labelId="knowledge-import-select-label"
              value={selectedKnowledgeId}
              label={t("ai.selectKnowledgeBase")}
              onChange={onKnowledgeChange}
            >
              {knowledges.map((knowledge) => (
                <MenuItem key={knowledge.id} value={knowledge.id}>
                  {knowledge.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {t("ai.selectedFilesCount", { count: selectedFileCount })}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          {t("ai.onlyFilesystemDocuments")}
        </Typography>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <FolderPicker />
        </Box>
      </DialogContent>
    </DraggableDialog>
  );
};

export default KnowledgeImportDialog;
