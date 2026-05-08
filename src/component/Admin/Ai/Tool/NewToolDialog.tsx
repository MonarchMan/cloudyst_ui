import { useTranslation } from "react-i18next";
import { AiTool } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { useEffect, useRef, useState } from "react";
import { createTool } from "../../../../api/api";
import DraggableDialog from "../../../Dialogs/DraggableDialog";
import { DialogContent, Stack } from "@mui/material";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../Common/StyledComponents";

export interface NewToolDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (tool: AiTool) => void;
}

const defaultTool: AiTool = {
  id: 0,
  name: "",
  description: "",
  type: "",
  parameters: "",
};

const NewToolDialog = ({ open, onClose, onCreated }: NewToolDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState<AiTool>({ ...defaultTool });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) {
      setTool({ ...defaultTool });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    setLoading(true);
    dispatch(createTool(tool))
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
      title={t("tool.new")}
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
            <SettingForm title={t("tool.name")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={tool.name}
                onChange={(e) => setTool({ ...tool, name: e.target.value })}
              />
            </SettingForm>
            <SettingForm title={t("tool.description")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={tool.description}
                onChange={(e) => setTool({ ...tool, description: e.target.value })}
              />
            </SettingForm>
            <SettingForm title={t("tool.type")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={tool.type}
                onChange={(e) => setTool({ ...tool, type: e.target.value })}
              />
            </SettingForm>
            <SettingForm title={t("tool.parameters")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={tool.parameters}
                onChange={(e) => setTool({ ...tool, parameters: e.target.value })}
              />
            </SettingForm>
          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};

export default NewToolDialog;
