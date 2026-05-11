import { useMediaQuery, Box, Grid2 as Grid, Typography, useTheme } from "@mui/material";
import { useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { DocumentDialogContext } from "./DocumentDialog";
import KnowledgeDialog from "../../Knowledge/KnowledgeDialog/KnowledgeDialog";
import { AiStatusSelect } from "../../AiSelects";

const DocumentForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setDocument } = useContext(DocumentDialogContext);
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const [knowledgeDialogID, setKnowledgeDialogID] = useState<number>(0);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument((prev) => ({ ...prev, name: e.target.value}))
  }, [setDocument]);

  const onUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument((prev) => ({ ...prev, url: e.target.value}))
  }, [setDocument]);

  const onVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument((prev) => ({ ...prev, version: e.target.value}))
  }, [setDocument]);
  
  const onSegmentMaxTokensChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument((prev) => ({ ...prev, temperature: Number(e.target.value)}))
  }, [setDocument]);

  return (
    <>
      <KnowledgeDialog open={knowledgeDialogOpen} onClose={() => setKnowledgeDialogOpen(false)} knowledgeID={knowledgeDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("document.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("document.name")} noContainer lgWidth={6}>
            <DenseFilledTextField type="number" fullWidth  value={values.name} required onChange={onNameChange} />
          </SettingForm>

          <SettingForm title={t("document.url")} noContainer lgWidth={6}>
            <DenseFilledTextField fullWidth  value={values.url} required onChange={onUrlChange} />
          </SettingForm>

          <SettingForm title={t("document.version")} noContainer lgWidth={6}>
            <DenseFilledTextField fullWidth  value={values.version} required onChange={onVersionChange} />
          </SettingForm>

          <SettingForm title={t("document.contentLength")} noContainer lgWidth={6}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.content_length}
            </Typography>
          </SettingForm>

          <SettingForm title={t("document.tokens")} noContainer lgWidth={6}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.tokens}
            </Typography>
          </SettingForm>

          <SettingForm title={t("document.segmentMaxTokens")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              slotProps={{
                htmlInput: {
                  type: "number",
                  min: 0,
                }
              }}
              value={values.segment_max_tokens ?? 0}
              onChange={onSegmentMaxTokensChange} />
          </SettingForm>

          <SettingForm title={t("document.retrivalCount")} noContainer lgWidth={6}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.retrival_count}
            </Typography>
          </SettingForm>

          <SettingForm title={t("common.status")} noContainer lgWidth={6}>
            <AiStatusSelect
              value={values.status}
              onChange={(status) => setDocument((prev) => ({ ...prev, status: status as Status }))}
            />
          </SettingForm>

          <SettingForm title={t("document.createdAt")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              value={values.created_at}
              slotProps={{ htmlInput: { readOnly: true }}}/>
          </SettingForm>

          <SettingForm title={t("document.updatedAt")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              value={values.updated_at}
              slotProps={{ htmlInput: { readOnly: true }}}/>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default DocumentForm;
