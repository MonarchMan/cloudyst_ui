import { useState, useEffect } from "react";
import { getChatConversationDetail } from "../../../../../api/api";
import { AiChatConversation } from "../../../../../api/dashboard";
import { DialogContent, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAppDispatch } from "../../../../../redux/hooks";
import AutoHeight from "../../../../Common/AutoHeight";
import FacebookCircularProgress from "../../../../Common/CircularProgress";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import ChatConversationForm from "./ChatConversationForm";

export interface ConversationDialogProps {
  open: boolean;
  onClose: () => void;
  conversationID?: number;
}

const ChatConversationDialog = ({ open, onClose, conversationID: conversationID }: ConversationDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AiChatConversation>({
    conversation: {
      id: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationID || !open) {
      return;
    }
    setLoading(true);
    dispatch(getChatConversationDetail(conversationID))
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
                {!loading && <ChatConversationForm values={values} />}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default ChatConversationDialog;
