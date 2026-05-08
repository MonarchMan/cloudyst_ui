import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { AiKnowledge } from "../../../../../api/dashboard";
import { DialogContent, Box, Collapse, DialogActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../../redux/hooks";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import { getKnowledgeDetail, upsertKnowledge } from "../../../../../api/api";
import KnowledgeForm from "./KnowledgeForm";

export interface KnowledgeDialogProps {
  open: boolean;
  onClose: () => void;
  knowledgeID?: number;
  onUpdated?: (apiKey: AiKnowledge) => void;
}

export interface KnowledgeDialogContextProps {
  values: AiKnowledge;
  setKnowledge: (f: (k: AiKnowledge) => AiKnowledge) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultKnowledge: AiKnowledge = {
  knowledge: {
      id: 0,
    name: "",
    ai_knowledge_document: []
  }
};

export const KnowledgeDialogContext = createContext<KnowledgeDialogContextProps>({
  values: { ...defaultKnowledge },
  setKnowledge: () => { },
});

const KnowledgeDialog = ({ open, onClose, knowledgeID, onUpdated }: KnowledgeDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiKnowledge>({
      ...defaultKnowledge,
  });
  const [modifiedValues, setModifiedValues] = useState<AiKnowledge>({
      ...defaultKnowledge,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
    const showSaveButton = useMemo(() => {
      return JSON.stringify(modifiedValues) !== JSON.stringify(values);
    }, [modifiedValues, values]);

  useEffect(() => {
      if (!knowledgeID || !open) {
          return;
      }
      setLoading(true);
      dispatch(getKnowledgeDetail(knowledgeID))
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
  
      const args: AiKnowledge = { ...modifiedValues };
  
      setSubmitting(true);
      dispatch(upsertKnowledge(args.knowledge))
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
    <KnowledgeDialogContext.Provider
      value={{
        values: modifiedValues,
        setKnowledge: setModifiedValues,
        formRef,
      }}
    >
    <DraggableDialog
      title={t("knowledge.knowledgeDialogTitle")}
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
                    {!loading && <KnowledgeForm />}
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
    </KnowledgeDialogContext.Provider>
  );
};

export default KnowledgeDialog;