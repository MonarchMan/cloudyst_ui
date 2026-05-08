import { useTranslation } from "react-i18next";
import { AiApiKey, Status } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { useEffect, useRef, useState } from "react";
import { createApiKey } from "../../../../api/api";
import DraggableDialog from "../../../Dialogs/DraggableDialog";
import { DialogContent, FormControl, Stack } from "@mui/material";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import { NoMarginHelperText } from "../../Settings/Settings";
import ApiKeySelectionInput from "../../Common/Ai/ApiKeySelectionInput";

export interface NewApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (apiKey: AiApiKey) => void;
}

const defaultApiKey: AiApiKey = {
  id: 0,
  name: "",
  platform: "",
  url: "",
  status: Status.active,
}

const NewApiKeyDialog = ({ open, onClose, onCreated }: NewApiKeyDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [copyFrom, setCopyFrom] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<AiApiKey>({ ...defaultApiKey });
  const formRef = useRef<HTMLFormElement>(null);
  const copyFromSrc = useRef<AiApiKey | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setApiKey({ ...defaultApiKey });
      setCopyFrom(0);
      copyFromSrc.current = undefined;
    }
  }, [open])

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    let newApiKey = { ...apiKey };
    if (copyFrom != 0 && copyFromSrc.current) {
      newApiKey = { ...copyFromSrc.current, id: 0, name: apiKey.name };
    }

    setLoading(true);
    dispatch(createApiKey(apiKey))
      .then((res) => {
        onCreated(res);
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <DraggableDialog
      onAccept={handleSubmit}
      loading={loading}
      title={t("apikey.new")}
      showActions
      showCancel
      dialogProps={{
        open,
        onClose,
        fullWidth: true,
        maxWidth: "sm",
      }}
    >
      <DialogContent>
        <form ref={formRef}>
          <Stack spacing={2}>
            <SettingForm title={t("apikey.name")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={apiKey.name}
                onChange={(e) => setApiKey({ ...apiKey, name: e.target.value })}
              />
              <NoMarginHelperText>{t("apikey.nameOfApikeyDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("apikey.copyFromExisting")} lgWidth={12}>
              <FormControl fullWidth>
                <ApiKeySelectionInput
                  value={copyFrom}
                  onChange={setCopyFrom}
                  onChangeApiKey={(k) => {
                    copyFromSrc.current = k;
                  }}
                  emptyValue={"0"}
                  emptyText={"apikey.notCopy"}
                />
              </FormControl>
            </SettingForm>
          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  )
};

export default NewApiKeyDialog;