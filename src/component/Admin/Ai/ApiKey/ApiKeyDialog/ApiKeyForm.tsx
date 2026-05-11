import { useCallback, useContext } from "react";
import { ApiKeyDialogContext } from "./ApiKeyDialog";
import { Box, Grid2 as Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Status } from "../../../../../api/dashboard";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import { AiApiKeyPlatformSelect, AiStatusSelect } from "../../AiSelects";

const ApiKeyForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setApiKey } = useContext(ApiKeyDialogContext);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey((prev) => ({ ...prev, name: e.target.value }))
    },
    [setApiKey],
  );

  const onApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiKey((prev) => ({ ...prev, api_key: e.target.value }))
    },
    [setApiKey],
  );

  const onUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiKey((prev) => ({ ...prev, url: e.target.value }))
    },
    [setApiKey],
  );

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Grid spacing={isMobile ? 2 : 3} direction={"column"} sx={{ minWidth: 200 }}>
        <SettingForm title={t("apikey.id")} noContainer lgWidth={12}>
          <Typography variant="body2" color="text.secondary">
            {values.id}
          </Typography>
        </SettingForm>
        
        <SettingForm title={t("apikey.name")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth value={values.name} required onChange={onNameChange} />
        </SettingForm>

        <SettingForm title={t("apikey.apiKey")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth value={values.api_key} required onChange={onApiKeyChange} />
        </SettingForm>
        
        <SettingForm title={t("apikey.platform")} noContainer lgWidth={12}>
          <AiApiKeyPlatformSelect
            required
            value={values.platform}
            onChange={(platform) => setApiKey((prev) => ({ ...prev, platform }))}
          />
        </SettingForm>
        
        <SettingForm title={t("apikey.url")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth value={values.url} onChange={onUrlChange} />
        </SettingForm>

        <SettingForm title={t("apikey.status")} noContainer lgWidth={12}>
          <AiStatusSelect
            value={values.status}
            onChange={(status) => setApiKey((prev) => ({ ...prev, status: status as Status }))}
          />
        </SettingForm>
        
        <SettingForm title={t("apikey.createdAt")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={values.created_at ?? ""}
            slotProps={{ htmlInput: { readOnly: true } }}
          />
        </SettingForm>
        
        <SettingForm title={t("apikey.UpdatedAt")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={values.updated_at ?? ""}
            slotProps={{ htmlInput: { readOnly: true } }}
          />
        </SettingForm>

      </Grid>
    </Box>
  )
}

export default ApiKeyForm;
