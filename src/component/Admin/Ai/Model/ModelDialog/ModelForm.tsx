import { Box, FormControl, Grid2 as Grid, ListItemText, SelectChangeEvent, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { ModelDialogContext } from "./ModelDialog";
import ApiKeyDialog from "../../ApiKey/ApiKeyDialog/ApiKeyDialog";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField, DenseSelect } from "../../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu";

const ModelForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setModel } = useContext(ModelDialogContext);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyDialogID, setApiKeyDialogID] = useState<number>(0);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, name: e.target.value}))
  }, [setModel]);

  const onTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, type: e.target.value}))
  }, [setModel]);

  const onPlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, platform: e.target.value}))
  }, [setModel]);

  const onSortChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, sort: Number(e.target.value)}))
  }, [setModel]);

  const onStatusChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
    setModel((prev) => ({ ...prev, status: Number(e.target.value) as Status}))
  }, [setModel]);

  const onTemperatureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, temperature: Number(e.target.value)}))
  }, [setModel]);

  const onMaxTokensChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, max_tokens: Number(e.target.value)}))
  }, [setModel]);

  const onMaxContextsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel((prev) => ({ ...prev, max_contexts: Number(e.target.value)}))
  }, [setModel]);


  const apiKeyClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setApiKeyDialogOpen(true);
    setApiKeyDialogID(values.api_key?.id ?? 0);
  };

  return (
    <>
      <ApiKeyDialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)} apiKeyID={apiKeyDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("model.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("model.name")} noContainer lgWidth={6}>
            <DenseFilledTextField type="number" fullWidth  value={values.name} required onChange={onNameChange} />
          </SettingForm>

          <SettingForm title={t("model.type")} noContainer lgWidth={6}>
            <DenseFilledTextField fullWidth  value={values.type} required onChange={onTypeChange} />
          </SettingForm>

          <SettingForm title={t("model.platform")} noContainer lgWidth={6}>
            <DenseFilledTextField fullWidth  value={values.platform} required onChange={onPlatformChange} />
          </SettingForm>

          <SettingForm title={t("model.sort")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              slotProps={{
                htmlInput: {
                  type: "number",
                  min: 0,
                }
              }}
              value={values.sort ?? 0}
              onChange={onSortChange} />
          </SettingForm>

          <SettingForm title={t("model.temperature")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              slotProps={{
                htmlInput: {
                  type: "number",
                  min: 0,
                }
              }}
              value={values.temperature ?? 0}
              onChange={onTemperatureChange} />
          </SettingForm>

          <SettingForm title={t("model.maxTokens")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              slotProps={{
                htmlInput: {
                  type: "number",
                  min: 0,
                }
              }}
              value={values.max_tokens ?? 0}
              onChange={onMaxTokensChange} />
          </SettingForm>

          <SettingForm title={t("model.maxContexts")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              slotProps={{
                htmlInput: {
                  type: "number",
                  min: 0,
                }
              }}
              value={values.max_contexts ?? 0}
                onChange={onMaxContextsChange} />
          </SettingForm>

          <SettingForm title={t("model.status")} noContainer lgWidth={6}>
            <FormControl fullWidth>
              <DenseSelect value={values.status} onChange={onStatusChange}>
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

          <SettingForm title={t("model.createdAt")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              value={values.created_at}
              slotProps={{ htmlInput: { readOnly: true }}}/>
          </SettingForm>

          <SettingForm title={t("model.updatedAt")} noContainer lgWidth={6}>
            <DenseFilledTextField
              fullWidth
              value={values.updated_at}
              slotProps={{ htmlInput: { readOnly: true }}}/>
          </SettingForm>

        </Grid>
      </Box>
    </>
  )
}

export default ModelForm;