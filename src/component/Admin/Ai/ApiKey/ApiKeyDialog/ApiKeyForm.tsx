import { useCallback, useContext, useState } from "react";
import { ApiKeyDialogContext } from "./ApiKeyDialog";
import { Box, FormControl, Grid2 as Grid, ListItemText, SelectChangeEvent, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../../redux/hooks";
import { Status } from "../../../../../api/dashboard";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { DenseFilledTextField, DenseSelect } from "../../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu";

const ApiKeyForm = () => {
  const dispatch = useAppDispatch();
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

  const onPlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiKey((prev) => ({ ...prev, platform: e.target.value }))
    },
    [setApiKey],
  );

  const onUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiKey((prev) => ({ ...prev, url: e.target.value }))
    },
    [setApiKey],
  );

  const onStatusChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      setApiKey((prev) => ({ ...prev, status: Number(e.target.value) as Status }))
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
        
        <SettingForm title={t("apikey.platfrom")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth value={values.platform} required onChange={onPlatformChange} />
        </SettingForm>
        
        <SettingForm title={t("apikey.url")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth value={values.url} onChange={onUrlChange} />
        </SettingForm>

        <SettingForm title={t("apikey.status")} noContainer lgWidth={12}>
          <FormControl fullWidth>
            <DenseSelect value={values.status} onChange={onStatusChange}>
              {Object.values(Status).map((value) => (
                <SquareMenuItem value={value} key={value}>
                  <ListItemText slotProps={{ primary: { variant: "body2" }}}>
                    {t(`model.status`)}
                  </ListItemText>
                </SquareMenuItem>
              ))}
            </DenseSelect>
          </FormControl>
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