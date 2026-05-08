import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiTool } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import { useTranslation } from "react-i18next";
import { getToolDetail, updateTool } from "../../../../../api/api";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import { Box, Button, Collapse, DialogActions, DialogContent } from "@mui/material";
import AutoHeight from "../../../../Common/AutoHeight";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import ToolForm from "./ToolForm";

export interface ToolDialogProps {
  open: boolean;
  onClose: () => void;
  toolID?: number;
  onUpdated?: (tool: AiTool) => void;
}

export interface ToolDialogContextProps {
  values: AiTool;
  setTool: (f: (p: AiTool) => AiTool) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

const defaultTool: AiTool = {
  id: 0,
  name: "",
};

export const ToolDialogContext = createContext<ToolDialogContextProps>({
  values: { ...defaultTool },
  setTool: () => {},
});

const ToolDialog = ({ open, onClose, toolID, onUpdated }: ToolDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiTool>({
    ...defaultTool,
  });
  const [modifiedValues, setModifiedValues] = useState<AiTool>({
    ...defaultTool,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showSaveButton = useMemo(() => {
    return JSON.stringify(modifiedValues) !== JSON.stringify(values);
  }, [modifiedValues, values]);

  const loadTool = useCallback(() => {
    if (!toolID) {
      return;
    }
    setLoading(true);
    dispatch(getToolDetail(toolID))
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
  }, [toolID]);

  useEffect(() => {
    loadTool();
  }, [toolID]);

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
    dispatch(updateTool(modifiedValues))
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
    <ToolDialogContext.Provider
      value={{
        values: modifiedValues,
        setTool: setModifiedValues,
        formRef,
      }}
    >
      <DraggableDialog
        title={t("tool.edit")}
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
                    <ToolForm />
                  </AutoHeight>
                </Box>
              )}
            </CSSTransition>
          </SwitchTransition>
        </DialogContent>
      </DraggableDialog>
    </ToolDialogContext.Provider>
  );
};

export default ToolDialog;
