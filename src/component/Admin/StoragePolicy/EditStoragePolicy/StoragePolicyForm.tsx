import { Alert, Box, Link, Stack } from "@mui/material";
import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import {
  BasicInfoSection,
  DownloadSection,
  MediaMetadataSection,
  StorageAndUploadSection,
  ThumbnailsSection,
} from "./FormSections";
import { StoragePolicySettingContext } from "./StoragePolicySettingWrapper";

const StoragePolicyForm = () => {
  const { t } = useTranslation("dashboard");
  const { formRef, values } = useContext(StoragePolicySettingContext);

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      
      <Stack spacing={5}>
        <BasicInfoSection />
        <StorageAndUploadSection />
        <DownloadSection />
        <ThumbnailsSection />
        <MediaMetadataSection />
      </Stack>
    </Box>
  );
};

export default StoragePolicyForm;
