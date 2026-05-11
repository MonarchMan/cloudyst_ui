import { Box, Grid2 as Grid, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ToolDialogContext } from "./ToolDialog";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import { AiStatusSelect } from "../../AiSelects";

const ToolForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setTool } = useContext(ToolDialogContext);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTool((prev) => ({ ...prev, name: e.target.value }));
    },
    [setTool],
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTool((prev) => ({ ...prev, description: e.target.value }));
    },
    [setTool],
  );

  const onTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTool((prev) => ({ ...prev, type: e.target.value }));
    },
    [setTool],
  );

  const onParametersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTool((prev) => ({ ...prev, parameters: e.target.value }));
    },
    [setTool],
  );

  return (
    <Box>
      <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
        <SettingForm title={t("tool.id")} noContainer lgWidth={2}>
          <DenseFilledTextField fullWidth value={values.id} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("tool.name")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.name} required onChange={onNameChange} />
        </SettingForm>

        <SettingForm title={t("tool.type")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.type} required onChange={onTypeChange} />
        </SettingForm>

        <SettingForm title={t("tool.description")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth multiline rows={3} value={values.description} onChange={onDescriptionChange} />
        </SettingForm>

        <SettingForm title={t("tool.parameters")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth multiline rows={3} value={values.parameters} onChange={onParametersChange} />
        </SettingForm>

        <SettingForm title={t("tool.status")} noContainer lgWidth={6}>
          <AiStatusSelect
            value={values.status}
            onChange={(status) => setTool((prev) => ({ ...prev, status: status as Status }))}
          />
        </SettingForm>

        <SettingForm title={t("tool.createdAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.created_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("tool.updatedAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.updated_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>
      </Grid>
    </Box>
  );
};

export default ToolForm;
