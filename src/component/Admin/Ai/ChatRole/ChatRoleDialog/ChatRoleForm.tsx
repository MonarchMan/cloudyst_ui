import { Box, Grid2 as Grid, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ChatRoleDialogContext } from "./ChatRoleDialog";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import { AiStatusSelect } from "../../AiSelects";

const ChatRoleForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setRole } = useContext(ChatRoleDialogContext);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, name: e.target.value } }));
    },
    [setRole],
  );

  const onAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, avatar: e.target.value } }));
    },
    [setRole],
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, description: e.target.value } }));
    },
    [setRole],
  );

  const onSortChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, sort: Number(e.target.value) } }));
    },
    [setRole],
  );

  const onCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, category: e.target.value } }));
    },
    [setRole],
  );

  const onSystemMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, role: { ...prev.role, system_message: e.target.value } }));
    },
    [setRole],
  );

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
        <SettingForm title={t("role.id")} noContainer lgWidth={2}>
          <DenseFilledTextField fullWidth value={values.role.id} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("role.name")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.role.name} required onChange={onNameChange} />
        </SettingForm>

        <SettingForm title={t("role.avatar")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.role.avatar} onChange={onAvatarChange} />
        </SettingForm>

        <SettingForm title={t("role.sort")} noContainer lgWidth={6}>
          <DenseFilledTextField
            fullWidth
            slotProps={{
              htmlInput: {
                type: "number",
                min: 0,
              },
            }}
            value={values.role.sort ?? 0}
            onChange={onSortChange}
          />
        </SettingForm>

        <SettingForm title={t("role.category")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.role.category} onChange={onCategoryChange} />
        </SettingForm>

        <SettingForm title={t("role.description")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth multiline rows={3} value={values.role.description} onChange={onDescriptionChange} />
        </SettingForm>

        <SettingForm title={t("role.systemMessage")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            multiline
            rows={4}
            value={values.role.system_message}
            onChange={onSystemMessageChange}
          />
        </SettingForm>

        <SettingForm title={t("role.status")} noContainer lgWidth={6}>
          <AiStatusSelect
            value={values.role.status}
            onChange={(status) => setRole((prev) => ({ ...prev, role: { ...prev.role, status: status as Status } }))}
          />
        </SettingForm>

        <SettingForm title={t("role.createdAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.role.created_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("role.updatedAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.role.updated_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>
      </Grid>
    </Box>
  );
};

export default ChatRoleForm;
