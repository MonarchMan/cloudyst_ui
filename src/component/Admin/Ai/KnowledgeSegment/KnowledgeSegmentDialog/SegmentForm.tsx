import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { AiKnowledgeSegment } from "../../../../../api/dashboard";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import DocumentDialog from "../../KnowledgeDocument/KnowledgeDocumentDialog/DocumentDialog";
import { NoWrapTypography } from "../../../../Common/StyledComponents";
import TimeBadge from "../../../../Common/TimeBadge";
import SettingForm from "../../../../Pages/Setting/SettingForm";

const SegmentForm =({ values }: { values: AiKnowledgeSegment}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentDialogID, setDocumentDialogID] = useState<number>(0);

  const documentClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setDocumentDialogOpen(true);
    setDocumentDialogID(values.document_id ?? 0);
  };

  return (
    <>
      <DocumentDialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} documentID={documentDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("segment.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("segment.contentLength")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.content_length ?? 0}
            </Typography>
          </SettingForm>
          <SettingForm title={t("segment.tokens")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.tokens ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("segment.views")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.vector_id}
            </Typography>
          </SettingForm>

          <SettingForm title={t("segment.downloads")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.retrival_count ?? 0}
            </Typography>
          </SettingForm>

          <SettingForm title={t("segment.srcDocumentName")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values?.ai_knowledge_document ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NoWrapTypography variant="inherit">
                    <Link href={`#/`} onClick={documentClicked} underline="hover">
                      {values?.ai_knowledge_document?.name}
                    </Link>
                  </NoWrapTypography>
                </Box>
              ) : (
                <em>{t("segment.deleted")}</em>
              )}
            </Typography>
          </SettingForm>
          <SettingForm title={t("segment.createdAt")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge datetime={values.created_at ?? ""} timeAgoThreshold={0} variant="inherit" />
            </Typography>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default SegmentForm;