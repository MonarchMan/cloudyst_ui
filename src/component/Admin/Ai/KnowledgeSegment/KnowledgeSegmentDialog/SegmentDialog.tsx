import { DialogContent, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { getSegmentDetail } from "../../../../../api/api";
import { AiKnowledgeSegment } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import SegmentForm from "./SegmentForm";

export interface SegmentDialogProps {
  open: boolean;
  onClose: () => void;
  segmentID?: number;
}

const SegmentDialog = ({ open, onClose, segmentID: segmentID }: SegmentDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiKnowledgeSegment>({ id: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!segmentID || !open) {
      return;
    }
    setLoading(true);
    dispatch(getSegmentDetail(segmentID))
      .then((res) => {
        setValues(res);
      })
      .catch(() => {
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  return (
    <DraggableDialog
      title={t("segment.segmentDialogTitle")}
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
                {!loading && <SegmentForm values={values} />}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default SegmentDialog;