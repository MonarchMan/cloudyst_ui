import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiModel } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import { useTranslation } from "react-i18next";
import { getModelDetail, updateModel } from "../../../../../api/api";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import { Box, Button, Collapse, DialogActions, DialogContent } from "@mui/material";
import AutoHeight from "../../../../Common/AutoHeight";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import ModelForm from "./ModelForm";

export interface ModelDialogProps {
  open: boolean;
  onClose: () => void;
  modelID?: number;
  onUpdated?: (model: AiModel) => void;
}

export interface ModelDialogContextProps {
  values: AiModel;
  setModel: (f: (p: AiModel) => AiModel) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultModel: AiModel = {
  id: 0,
  name: "",
  model: "",
}

export const ModelDialogContext = createContext<ModelDialogContextProps>({
  values: { ...defaultModel },
  setModel: () => {},
})

const ModelDialog = ({ open, onClose, modelID, onUpdated }: ModelDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiModel>({
    ...defaultModel,
  });
  const [modifiedValues, setModifiedValues] = useState<AiModel>({
    ...defaultModel,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showSaveButton = useMemo(() => {
    return JSON.stringify(modifiedValues) !== JSON.stringify(values);
  }, [modifiedValues, values]);

  const loadModel = useCallback(() => {
    if (!modelID) {
      return;
    }
    setLoading(true);
    dispatch(getModelDetail(modelID))
      .then((res) => {
        setValues(res);
        setModifiedValues(res);
      })
      .catch(() => {
        onClose();
      })
      .finally(() => {
        setLoading(false);
      })
  }, [modelID]);

  useEffect(() => {
    loadModel();
  }, [modelID]);

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

    const args: AiModel = { ...modifiedValues };

    setSubmitting(true);
    dispatch(updateModel(args))
      .then((res) => {
        setValues(res);
        setModifiedValues(values);
        onUpdated?.(res);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <ModelDialogContext.Provider
      value={{
        values: modifiedValues,
        setModel: setModifiedValues,
        formRef,
      }}
    >
      <DraggableDialog
        title={t("model.modelDialogTitle")}
        dialogProps={{
          fullWidth: true,
          maxWidth: "md",
          open: open,
          onClose: onClose,
        }}>
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
                    {!loading && <ModelForm />}
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
    </ModelDialogContext.Provider>
  )
};

export default ModelDialog;
