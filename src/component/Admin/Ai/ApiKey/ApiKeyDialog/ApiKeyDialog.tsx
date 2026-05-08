import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { AiApiKey } from "../../../../../api/dashboard";
import { getApiKeyDetail, updateApiKey } from "../../../../../api/api";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import { Box, Button, Collapse, DialogActions, DialogContent } from "@mui/material";
import AutoHeight from "../../../../Common/AutoHeight";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import { useAppDispatch } from "../../../../../redux/hooks";
import { useTranslation } from "react-i18next";
import ApiKeyForm from "./ApiKeyForm";

export interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  apiKeyID?: number;
  onUpdated?: (apiKey: AiApiKey) => void;
}

export interface ApiKeyDialogContextProps {
  values: AiApiKey;
  setApiKey: (f: (p: AiApiKey) => AiApiKey) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultApiKey: AiApiKey = {
  id: 0,
  name: "",
  api_key: "",
};

export const ApiKeyDialogContext = createContext<ApiKeyDialogContextProps>({
  values: { ...defaultApiKey },
  setApiKey: () => { },
});

const ApiKeyDialog = ({ open, onClose, apiKeyID, onUpdated }: ApiKeyDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiApiKey>({
      ...defaultApiKey,
  });
  const [modifiedValues, setModifiedValues] = useState<AiApiKey>({
      ...defaultApiKey,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
    const showSaveButton = useMemo(() => {
      return JSON.stringify(modifiedValues) !== JSON.stringify(values);
    }, [modifiedValues, values]);

  useEffect(() => {
      if (!apiKeyID || !open) {
          return;
      }
      setLoading(true);
      dispatch(getApiKeyDetail(apiKeyID))
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
  }, [open]);

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

      const args: AiApiKey = {
          ...modifiedValues,
      };

      setSubmitting(true);
      dispatch(updateApiKey(args))
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
    <ApiKeyDialogContext.Provider
      value={{
        values: modifiedValues,
        setApiKey: setModifiedValues,
        formRef,
      }}
    >
    <DraggableDialog
      title={t("apikey.apiKeyDialogTitle")}
      dialogProps={{
        fullWidth: true,
        maxWidth: "md",
        open: open,
        onClose: onClose,
      }}
      >
        <DialogContent>
          <AutoHeight>
            <SwitchTransition>
              <CSSTransition
                addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
                classNames="fade"
                key={`${loading}`}
              >
                <Box>
                    {loading && (
                      <Box
                        sx={{
                          py: 15,
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                      <FacebookCircularProgress />
                      </Box>
                    )}
                    {!loading && <ApiKeyForm />}
                </Box>
              </CSSTransition>
            </SwitchTransition>
          </AutoHeight>
        </DialogContent>
        <Collapse in={showSaveButton}>
        <DialogActions>
            <Button disabled={submitting} onClick={revert}>
            {t("settings.revert")}
            </Button>
            <Button loading={submitting} variant="contained" onClick={submit}>
            {t("settings.save")}
            </Button>
        </DialogActions>
        </Collapse>
      </DraggableDialog>
    </ApiKeyDialogContext.Provider>
  );

}

export default ApiKeyDialog;