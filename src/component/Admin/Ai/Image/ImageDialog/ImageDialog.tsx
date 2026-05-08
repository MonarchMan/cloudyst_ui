import { useState, useEffect } from "react";
import { getImage, getImageDetail } from "../../../../../api/api";
import { AiImage } from "../../../../../api/dashboard";
import { DialogContent, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAppDispatch } from "../../../../../redux/hooks";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import ImageForm from "./ImageForm";

export interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  imageID?: number;
}

const ImageDialog = ({ open, onClose, imageID }: ImageDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiImage>({
    image: {
      id: 0,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageID || !open) {
      return;
    }
    setLoading(true);
    dispatch(getImageDetail(imageID))
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
                {!loading && <ImageForm values={values} />}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default ImageDialog;
