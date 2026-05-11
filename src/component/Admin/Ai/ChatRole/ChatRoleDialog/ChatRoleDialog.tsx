import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiChatRole } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import { useTranslation } from "react-i18next";
import { getChatRoleDetail, upsertRole } from "../../../../../api/api";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import { Box, Button, Collapse, DialogActions, DialogContent } from "@mui/material";
import AutoHeight from "../../../../Common/AutoHeight";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import ChatRoleForm from "./ChatRoleForm";

export interface ChatRoleDialogProps {
  open: boolean;
  onClose: () => void;
  roleID?: number;
  onUpdated?: (role: AiChatRole) => void;
}

export interface ChatRoleDialogContextProps {
  values: AiChatRole;
  setRole: (f: (p: AiChatRole) => AiChatRole) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultRole: AiChatRole = {
  role: {
    id: 0,
    name: "",
  }
};

export const ChatRoleDialogContext = createContext<ChatRoleDialogContextProps>({
  values: { ...defaultRole },
  setRole: () => {},
});

const ChatRoleDialog = ({ open, onClose, roleID, onUpdated }: ChatRoleDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiChatRole>({
    ...defaultRole,
  });
  const [modifiedValues, setModifiedValues] = useState<AiChatRole>({
    ...defaultRole,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showSaveButton = useMemo(() => {
    return JSON.stringify(modifiedValues) !== JSON.stringify(values);
  }, [modifiedValues, values]);

  const loadRole = useCallback(() => {
    if (!roleID) {
      return;
    }
    setLoading(true);
    dispatch(getChatRoleDetail(roleID))
      .then((res) => {
        setValues(res);
        setModifiedValues(res);
      })
      .catch(() => {
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [roleID]);

  useEffect(() => {
    loadRole();
  }, [roleID]);

  const revert = () => {
    setModifiedValues(values);
  };

  const submit = () => {
    if (formRef.current) {
      if (!formRef.current.checkValidity()) {
        formRef.current.reportValidity();
        return;
      }
    }

    setSubmitting(true);
    dispatch(upsertRole(modifiedValues.role))
      .then((res) => {
        setValues(res);
        setModifiedValues(res);
        onUpdated?.(res);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <ChatRoleDialogContext.Provider
      value={{
        values: modifiedValues,
        setRole: setModifiedValues,
        formRef,
      }}
    >
      <DraggableDialog
        title={t("role.edit")}
        showActions={false}
        dialogProps={{
          open: open,
          onClose: onClose,
          fullWidth: true,
          maxWidth: "md",
        }}
      >
        <DialogContent>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={loading ? "loading" : "loaded"}
              addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
              classNames="fade"
            >
              {loading ? (
                <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FacebookCircularProgress />
                </Box>
              ) : (
                <Box>
                  <Collapse in={showSaveButton}>
                    <DialogActions>
                      <Button onClick={revert}>{t("setting.revert")}</Button>
                      <Button variant="contained" disabled={submitting} onClick={submit}>
                        {t("setting.save")}
                      </Button>
                    </DialogActions>
                  </Collapse>
                  <AutoHeight>
                    <ChatRoleForm />
                  </AutoHeight>
                </Box>
              )}
            </CSSTransition>
          </SwitchTransition>
        </DialogContent>
      </DraggableDialog>
    </ChatRoleDialogContext.Provider>
  );
};

export default ChatRoleDialog;
