import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiKnowledgeDocument } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import { useTranslation } from "react-i18next";
import { getDocumentDetail, updateDocumentAdmin } from "../../../../../api/api";
import { DialogContent, Box, Collapse, DialogActions, Button } from "@mui/material";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import DocumentForm from "./DocumentForm";

export interface DocumentDialogProps {
  open: boolean;
    onClose: () => void;
    documentID?: number;
    onUpdated?: (model: AiKnowledgeDocument) => void;
}

export interface DocumentDialogContextProps {
  values: AiKnowledgeDocument;
  setDocument: (f: (d: AiKnowledgeDocument) => AiKnowledgeDocument) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultDocument: AiKnowledgeDocument = {
  id: 0,
  name: "",
}

export const DocumentDialogContext = createContext<DocumentDialogContextProps>({
  values: { ...defaultDocument },
  setDocument: () => {},
})

const DocumentDialog = ({ open, onClose, documentID, onUpdated }: DocumentDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiKnowledgeDocument>({
    ...defaultDocument,
  });
  const [modifiedValues, setModifiedValues] = useState<AiKnowledgeDocument>({
    ...defaultDocument,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showSaveButton = useMemo(() => {
    return JSON.stringify(modifiedValues) !== JSON.stringify(values);
  }, [modifiedValues, values]);

  const loadDocument = useCallback(() => {
    if (!documentID) {
      return;
    }
    setLoading(true);
    dispatch(getDocumentDetail(documentID))
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
  }, [documentID]);

  useEffect(() => { loadDocument() }, [documentID]);

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

    const args: AiKnowledgeDocument = { ...modifiedValues };

    setSubmitting(true);
    dispatch(updateDocumentAdmin(args))
      .then((res) => {
        setValues(res);
        setModifiedValues(values);
        onUpdated?.(res);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <DocumentDialogContext.Provider
      value={{
        values: modifiedValues,
        setDocument: setModifiedValues,
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
                    {!loading && <DocumentForm />}
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
    </DocumentDialogContext.Provider>
  );
};

export default DocumentDialog;