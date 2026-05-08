import { Box, FormControl, Grid2 as Grid, ListItemText, SelectChangeEvent, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ChatRoleDialogContext } from "./ChatRoleDialog";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField, DenseSelect } from "../../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu";

const ChatRoleForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setRole } = useContext(ChatRoleDialogContext);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, name: e.target.value }));
    },
    [setRole],
  );

  const onAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, avatar: e.target.value }));
    },
    [setRole],
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, description: e.target.value }));
    },
    [setRole],
  );

  const onSortChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, sort: Number(e.target.value) }));
    },
    [setRole],
  );

  const onCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, category: e.target.value }));
    },
    [setRole],
  );

  const onSystemMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRole((prev) => ({ ...prev, system_message: e.target.value }));
    },
    [setRole],
  );

  const onStatusChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      setRole((prev) => ({ ...prev, status: Number(e.target.value) as Status }));
    },
    [setRole],
  );

  return (
    <Box>
      <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
        <SettingForm title={t("role.id")} noContainer lgWidth={2}>
          <DenseFilledTextField fullWidth value={values.id} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("role.name")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.name} required onChange={onNameChange} />
        </SettingForm>

        <SettingForm title={t("role.avatar")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.avatar} onChange={onAvatarChange} />
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
            value={values.sort ?? 0}
            onChange={onSortChange}
          />
        </SettingForm>

        <SettingForm title={t("role.category")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.category} onChange={onCategoryChange} />
        </SettingForm>

        <SettingForm title={t("role.description")} noContainer lgWidth={12}>
          <DenseFilledTextField fullWidth multiline rows={3} value={values.description} onChange={onDescriptionChange} />
        </SettingForm>

        <SettingForm title={t("role.systemMessage")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            multiline
            rows={4}
            value={values.system_message}
            onChange={onSystemMessageChange}
          />
        </SettingForm>

        <SettingForm title={t("role.status")} noContainer lgWidth={6}>
          <FormControl fullWidth>
            <DenseSelect value={values.status} onChange={onStatusChange}>
              <SquareMenuItem value={1}>
                <ListItemText slotProps={{ primary: { variant: "body2" } }}>
                  {t("common.status_active")}
                </ListItemText>
              </SquareMenuItem>
              <SquareMenuItem value={2}>
                <ListItemText slotProps={{ primary: { variant: "body2" } }}>
                  {t("common.status_inactive")}
                </ListItemText>
              </SquareMenuItem>
            </DenseSelect>
          </FormControl>
        </SettingForm>

        <SettingForm title={t("role.createdAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.created_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>

        <SettingForm title={t("role.updatedAt")} noContainer lgWidth={6}>
          <DenseFilledTextField fullWidth value={values.updated_at} slotProps={{ htmlInput: { readOnly: true } }} />
        </SettingForm>
      </Grid>
    </Box>
  );
};

export default ChatRoleForm;
