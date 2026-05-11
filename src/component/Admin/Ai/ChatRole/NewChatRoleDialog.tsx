import { useTranslation } from "react-i18next";
import { AiChatRole } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { useEffect, useRef, useState } from "react";
import { upsertRole } from "../../../../api/api";
import DraggableDialog from "../../../Dialogs/DraggableDialog";
import { DialogContent, Stack } from "@mui/material";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { DenseFilledTextField } from "../../../Common/StyledComponents";

export interface NewChatRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (role: AiChatRole) => void;
}

const defaultRole: AiChatRole = {
  role: {
    id: 0,
    name: "",
    description: "",
    category: "",
    system_message: "",
  }
};

const NewChatRoleDialog = ({ open, onClose, onCreated }: NewChatRoleDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<AiChatRole>({ ...defaultRole });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) {
      setRole({ ...defaultRole });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    setLoading(true);
    dispatch(upsertRole(role.role))
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
      title={t("role.new")}
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
            <SettingForm title={t("role.name")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                required
                value={role.role.name}
                onChange={(e) => setRole({ ...role, role: { ...role.role, name: e.target.value } })}
              />
            </SettingForm>
            <SettingForm title={t("role.description")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={role.role.description}
                onChange={(e) => setRole({ ...role, role: { ...role.role, description: e.target.value } })}
              />
            </SettingForm>
            <SettingForm title={t("role.category")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                value={role.role.category}
                onChange={(e) => setRole({ ...role, role: { ...role.role, category: e.target.value } })}
              />
            </SettingForm>
            <SettingForm title={t("role.systemMessage")} lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                multiline
                rows={4}
                value={role.role.system_message}
                onChange={(e) => setRole({ ...role, role: { ...role.role, system_message: e.target.value } })}
              />
            </SettingForm>
          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};

export default NewChatRoleDialog;
