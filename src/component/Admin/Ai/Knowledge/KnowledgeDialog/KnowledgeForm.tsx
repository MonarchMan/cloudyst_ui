import { Box, FormControl, FormControlLabel, Grid2 as Grid, Link, ListItemText, SelectChangeEvent, Switch, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { KnowledgeDialogContext } from "./KnowledgeDialog";
import { Status } from "../../../../../api/dashboard";
import { DenseFilledTextField, DenseSelect, NoWrapTypography } from "../../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import { NoMarginHelperText } from "../../../Settings/Settings";
import UserDialog from "../../../User/UserDialog/UserDialog";
import UserAvatar from "../../../../Common/User/UserAvatar";

const KnowledgeForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const { formRef, values, setKnowledge } = useContext(KnowledgeDialogContext);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        setKnowledge((prev) => ({ ...prev, name: e.target.value }))
    },
    [setKnowledge],
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKnowledge((prev) => ({ ...prev, description: e.target.value }))
    },
    [setKnowledge],
  );

  const onTopKChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKnowledge((prev) => ({ ...prev, top_k: Number(e.target.value) }))
    },
    [setKnowledge],
  );

  const onSimilarityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKnowledge((prev) => ({ ...prev, similarity_threshold: Number(e.target.value) }))
    },
    [setKnowledge],
  );

  const onIsPublicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKnowledge((prev) => ({ ...prev, is_public: e.target.checked}))
    },
    [setKnowledge],
  );

  const onIsMasterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKnowledge((prev) => ({ ...prev, is_public: e.target.checked}))
    },
    [setKnowledge],
  );

  const onStatusChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      setKnowledge((prev) => ({ ...prev, status: Number(e.target.value) as Status }))
    },
    [setKnowledge],
  );

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values.knowledge.user_id ?? 0);
  };

    return (
      <>
        <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
        <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <Grid spacing={isMobile ? 2 : 3} direction={"column"} sx={{ minWidth: 200 }}>
            <SettingForm title={t("apikey.id")} noContainer lgWidth={12}>
              <Typography variant="body2" color="text.secondary">
                {values.knowledge.id}
              </Typography>
            </SettingForm>
            
            <SettingForm title={t("knowledge.name")} noContainer lgWidth={12}>
              <DenseFilledTextField fullWidth value={values.knowledge.name} required onChange={onNameChange} />
            </SettingForm>

            <SettingForm title={t("knowledge.description")} noContainer lgWidth={12}>
              <DenseFilledTextField fullWidth value={values.knowledge.description} required onChange={onDescriptionChange} />
            </SettingForm>
            
            <SettingForm title={t("knowledge.topK")} noContainer lgWidth={12}>
              <DenseFilledTextField fullWidth value={values.knowledge.top_k} required onChange={onTopKChange} />
            </SettingForm>
            
            <SettingForm title={t("knowledge.similarity")} noContainer lgWidth={12}>
              <DenseFilledTextField fullWidth value={values.knowledge.similarity_threshold} onChange={onSimilarityChange} />
            </SettingForm>

            <SettingForm title={t("knowledge.owner")} noContainer lgWidth={4}>
              <NoWrapTypography variant={"body2"} color={"textSecondary"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <UserAvatar
                    sx={{ width: 24, height: 24 }}
                    overwriteTextSize
                    user={{
                      id: values.owner_info?.id ?? "",
                      nickname: values.owner_info?.nickname ?? "",
                      created_at: values.owner_info?.created_at ?? "",
                    }}
                  />
                  <NoWrapTypography variant="inherit">
                    <Link
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      onClick={userClicked}
                      underline="hover"
                      href="#/"
                    >
                      {values.owner_info?.nickname ?? ""}
                    </Link>
                  </NoWrapTypography>
                </Box>
              </NoWrapTypography>
            </SettingForm>

            <SettingForm lgWidth={5}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.knowledge.is_public}
                        onChange={onIsPublicChange}
                      />
                    }
                    label={t("knowledge.isPublic")}
                  />
                  <NoMarginHelperText>{t("knowledge.isPublicDes")}</NoMarginHelperText>
                </FormControl>
              </SettingForm>

            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.knowledge.is_master}
                      onChange={onIsMasterChange}
                    />
                  }
                  label={t("knowledge.isMaster")}
                />
                <NoMarginHelperText>{t("knowledge.isMasterDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("knowledge.status")} noContainer lgWidth={12}>
              <FormControl fullWidth>
                <DenseSelect value={values.knowledge.status} onChange={onStatusChange}>
                  {Object.values(Status).map((value) => (
                    <SquareMenuItem value={value} key={value}>
                      <ListItemText slotProps={{ primary: { variant: "body2" }}}>
                        {t(`knowledge.status`)}
                      </ListItemText>
                    </SquareMenuItem>
                  ))}
                </DenseSelect>
              </FormControl>
            </SettingForm>
            
            <SettingForm title={t("knowledge.createdAt")} noContainer lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={values.knowledge.created_at ?? ""}
                slotProps={{ htmlInput: { readOnly: true } }}
              />
            </SettingForm>
            
            <SettingForm title={t("knowledge.UpdatedAt")} noContainer lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={values.knowledge.updated_at ?? ""}
                slotProps={{ htmlInput: { readOnly: true } }}
              />
            </SettingForm>

          </Grid>
        </Box>
      </>
      
    );
};

export default KnowledgeForm;