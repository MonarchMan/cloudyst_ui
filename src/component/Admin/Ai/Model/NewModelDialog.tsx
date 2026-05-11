import { useTranslation } from "react-i18next";
import { AiModel } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { useEffect, useRef, useState } from "react";
import { createModel } from "../../../../api/api";
import DraggableDialog from "../../../Dialogs/DraggableDialog";
import { DialogContent, Stack } from "@mui/material";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import { NoMarginHelperText } from "../../Settings/Settings";
import ApiKeySelectionInput from "../../Common/Ai/ApiKeySelectionInput";
import { AiModelTypeSelect } from "../AiSelects";

export interface NewModelDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (model: AiModel) => void;
}

const defaultModel: AiModel = {
  id: 0,
  name: "",
  model: "",
  type: "",
  platform: "",
}

const optionalNumber = (value: string) => (value === "" ? undefined : Number(value));

const NewModelDialog = ({ open, onClose, onCreated }: NewModelDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<AiModel>({ ...defaultModel });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if(open) {
      setModel({ ...defaultModel });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    setLoading(true);
    dispatch(createModel(model))
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
      title={t("model.new")}
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
            <SettingForm title={t("model.name")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={model.name}
                onChange={(e) => setModel({ ...model, name: e.target.value })}
              />
              <NoMarginHelperText>{t("model.nameOfModelDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("model.model")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={model.model ?? ""}
                onChange={(e) => setModel({ ...model, model: e.target.value })}
              />
              <NoMarginHelperText>{t("model.providerModelDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("model.type")} lgWidth={12}>
              <AiModelTypeSelect
                required
                value={model.type}
                onChange={(type) => setModel({ ...model, type })}
              />
              <NoMarginHelperText>{t("model.typeOfModelDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("model.temperature")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                slotProps={{
                  htmlInput: {
                    type: "number",
                    min: 0,
                  }
                }}
                value={model.temperature ?? ""}
                onChange={(e) => setModel((prev) => ({ ...prev, temperature: optionalNumber(e.target.value) }))}
              />
              <NoMarginHelperText>{t("model.temperatureOfModelDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("model.maxTokens")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                slotProps={{
                  htmlInput: {
                    type: "number",
                    min: 0,
                  }
                }}
                value={model.max_tokens ?? ""}
                onChange={(e) => setModel((prev) => ({ ...prev, max_tokens: optionalNumber(e.target.value) }))}
              />
              <NoMarginHelperText>{t("model.maxTokensOfModelDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("model.maxContexts")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                slotProps={{
                  htmlInput: {
                    type: "number",
                    min: 0,
                  }
                }}
                value={model.max_contexts ?? ""}
                onChange={(e) => setModel((prev) => ({ ...prev, max_contexts: optionalNumber(e.target.value) }))}
              />
              <NoMarginHelperText>{t("model.maxContextsOfModelDes")}</NoMarginHelperText>
            </SettingForm>
          
            <SettingForm title={t("model.apiKey")} lgWidth={12}>
              <ApiKeySelectionInput
                required
                value={model.key_id ?? 0}
                onChange={(e) => setModel({ ...model, key_id: e })}
                fullWidth
              />
            </SettingForm>
          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};

export default NewModelDialog;
