import { DialogContent, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { getChatMessageDetail } from "../../../../../api/api";
import { AiChatMessage } from "../../../../../api/dashboard";
import { useAppDispatch } from "../../../../../redux/hooks";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import ChatMessageForm from "./ChatMessageForm";

export interface ChatMessageDialogProps {
  open: boolean;
  onClose: () => void;
  messageID?: number;
}

const ChatMessageDialog = ({ open, onClose, messageID: messageID }: ChatMessageDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiChatMessage>({
    message: {
      id: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!messageID || !open) {
      return;
    }
    setLoading(true);
    dispatch(getChatMessageDetail(messageID))
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
                {!loading && <ChatMessageForm values={values} />}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default ChatMessageDialog;