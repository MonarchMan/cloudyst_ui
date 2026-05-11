import { DialogContent, Stack, FormControl, FormControlLabel, Switch } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createApiKey } from "../../../../api/api";
import { AiKnowledgeModel, Status } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import DraggableDialog from "../../../Dialogs/DraggableDialog";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { NoMarginHelperText } from "../../Settings/Settings";

export interface NewKnowledgeDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (apiKey: AiKnowledgeModel) => void;
}

const defaultKnowledge: AiKnowledgeModel = {
  id: 0,
  name: "",
  description: "",
  status: Status.active,
  is_public: false,
}

const optionalNumber = (value: string) => (value === "" ? undefined : Number(value));

const NewKnowledgeDialog = ({ open, onClose, onCreated }: NewKnowledgeDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [copyFrom, setCopyFrom] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [knowledge, setKnowledge] = useState<AiKnowledgeModel>({ ...defaultKnowledge });
  const formRef = useRef<HTMLFormElement>(null);
  const copyFromSrc = useRef<AiKnowledgeModel | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setKnowledge({ ...defaultKnowledge });
      setCopyFrom("0");
      copyFromSrc.current = undefined;
    }
  }, [open])

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    let newApiKey = { ...knowledge };
    if (copyFrom != "0" && copyFromSrc.current) {
      newApiKey = { ...copyFromSrc.current, id: 0, name: knowledge.name };
    }

    setLoading(true);
    dispatch(createApiKey(knowledge))
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
            <SettingForm title={t("knowledge.name")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={knowledge.name}
                onChange={(e) => setKnowledge({ ...knowledge, name: e.target.value })}
              />
              <NoMarginHelperText>{t("knowledge.nameOfKnowledgeDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("knowledge.description")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={knowledge.description ?? ""}
                onChange={(e) => setKnowledge({ ...knowledge, description: e.target.value })}
              />
              <NoMarginHelperText>{t("knowledge.nameOfKnowledgeDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("knowledge.topK")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                slotProps={{
                  htmlInput: {
                    type: "number",
                    min: 0,
                  }
                }}
                value={knowledge.top_k ?? ""}
                onChange={(e) => setKnowledge((prev) => ({ ...prev, top_k: optionalNumber(e.target.value) }))}
              />
              <NoMarginHelperText>{t("model.topKOfKnowledgeDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("knowledge.similarity")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                slotProps={{
                  htmlInput: {
                    type: "number",
                    min: 0,
                  }
                }}
                value={knowledge.similarity_threshold ?? ""}
                onChange={(e) => setKnowledge((prev) => ({ ...prev, similarity_threshold: optionalNumber(e.target.value) }))}
              />
              <NoMarginHelperText>{t("knowledge.similarityOfKnowledgeDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={knowledge.is_public ?? false}
                      onChange={(e) => setKnowledge({ ...knowledge, is_public: e.target.checked })}
                    />
                  }
                  label={t("knowledge.isPublic")}
                />
                <NoMarginHelperText>{t("knowledge.isPublicDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};

export default NewKnowledgeDialog;
