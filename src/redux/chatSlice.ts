import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetChatConversationResponse, ListConversationResponse, MessageRecord, MessageStatus } from "../api/ai";
import SessionManager, { UserSettings } from "../session";

export interface ChatState {
  list?: ListConversationResponse;
  currentConversationID: string | null;
  messages: Record<string, MessageRecord[]>;
  loading: boolean;
  error: string | null;
  pageSize: number;
}

const defaultState: ChatState = {
  currentConversationID: null,
  messages: {},
  loading: false,
  error: null,
  pageSize: SessionManager.getWithFallback(UserSettings.PageSize),
};

const initialState: ChatState = defaultState;

export const chatStateSlice = createSlice({
  name: "chatStateSlice",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      if (state.list?.pagination) {
        state.list.pagination.page = action.payload;
      }
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      if (state.list?.pagination) {
        state.list.pagination.page_size = action.payload;
      }
    },
    setList: (state, action: PayloadAction<ListConversationResponse>) => {
      state.list = action.payload;
    },
    setCurrentConversationID: (state, action: PayloadAction<string | null>) => {
      state.currentConversationID = action.payload;
      // initialize messages for the conversation if not exist
      if (action.payload && !state.messages[action.payload]) {
        state.messages[action.payload] = [];
      }
    },
    setMessages: (state, action: PayloadAction<{ conversationID: string; messages: MessageRecord[] }>) => {
      const { conversationID, messages } = action.payload;
      state.messages[conversationID] = messages;
    },
    newConversation: (state, action: PayloadAction<GetChatConversationResponse>) => {
      state.list?.conversations.unshift(action.payload);
      state.currentConversationID = action.payload.id;
      state.messages[action.payload.id] = [];
    },
    appendMessage: (state, action: PayloadAction<MessageRecord>) => {
      const msg = action.payload;
      const conversationID = msg.conversation_id;
      if (!state.messages[conversationID]) {
        state.messages[conversationID] = [];
      }
      state.messages[conversationID].push(msg);
    },
    // 用服务端确认的消息替换乐观写入的临时消息
    confirmUserMessage(state, action: PayloadAction<{ tempId: string; confirmed: MessageRecord }>) {
      const { tempId, confirmed } = action.payload;
      const conv = state.messages[confirmed.conversation_id];
      if (!conv) return;
      const idx = conv.findIndex((m) => m.id === tempId);
      if (idx !== -1) {
        conv[idx] = {
          ...conv[idx],
          ...confirmed,
          type: "send",
        };
      }
    },
    confirmAssistantMessage(state, action: PayloadAction<{ tempId: string; confirmed: MessageRecord }>) {
      const { tempId, confirmed } = action.payload;
      const conv = state.messages[confirmed.conversation_id];
      if (!conv) return;
      const idx = conv.findIndex((m) => m.id === tempId);
      if (idx !== -1) {
        conv[idx] = {
          ...confirmed,
          type: "receive",
        };
      } else {
        conv.push({
          ...confirmed,
          type: "receive",
        });
      }
    },
    // stream response
    appendStreamMessage: (state, action: PayloadAction<MessageRecord>) => {
      const newMsg = action.payload;
      const msg = state.messages[newMsg.conversation_id]?.find((m) => m.id === newMsg.id);
      if (msg) {
        msg.type = "receive";
        msg.content += newMsg.content;
        msg.status = newMsg.status ?? msg.status;
        msg.error_message = newMsg.error_message ?? msg.error_message;
        msg.reply_id = newMsg.reply_id ?? msg.reply_id;
        if (newMsg.reason_content){
          msg.reason_content = (msg.reason_content ?? "") + (newMsg.reason_content ?? "");
        }
        if (newMsg.segments) {
          msg.segments = newMsg.segments;
        }
        if (newMsg.web_pages) {
          msg.web_pages = newMsg.web_pages;
        }
      } else {
        if (!state.messages[newMsg.conversation_id]) {
          state.messages[newMsg.conversation_id] = [];
        }
        state.messages[newMsg.conversation_id].push(newMsg);
      }
    },
    upsertMessage: (state, action: PayloadAction<MessageRecord>) => {
      const msg = action.payload;
      const conversationID = msg.conversation_id;
      if (!state.messages[conversationID]) {
        state.messages[conversationID] = [];
      }
      const idx = state.messages[conversationID].findIndex((item) => item.id === msg.id);
      if (idx >= 0) {
        state.messages[conversationID][idx] = {
          ...state.messages[conversationID][idx],
          ...msg,
        };
      } else {
        state.messages[conversationID].push(msg);
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ conversationID: string; messageID: string; status: MessageStatus; error_message?: string }>,
    ) => {
      const { conversationID, messageID, status, error_message } = action.payload;
      const msg = state.messages[conversationID]?.find((m) => m.id === messageID);
      if (!msg) return;
      msg.status = status;
      msg.error_message = error_message;
    },
    removeMessage: (state, action: PayloadAction<{ conversationID: string; messageID: string }>) => {
      const { conversationID, messageID } = action.payload;
      if (!state.messages[conversationID]) return;
      state.messages[conversationID] = state.messages[conversationID].filter((m) => m.id !== messageID);
    },
    updateConversation: (state, action: PayloadAction<GetChatConversationResponse>) => {
      const updated = action.payload;
      const idx = state.list?.conversations.findIndex((c) => c.id === updated.id) ?? -1;
      if (idx >= 0 && state.list) {
        state.list.conversations[idx] = updated;
      }
    },
    renameConversation: (state, action: PayloadAction<{ conversationID: string; newTitle: string }>) => {
      const { conversationID, newTitle } = action.payload;
      const conversation = state.list?.conversations.find((c) => c.id === conversationID);
      if (conversation) {
        conversation.title = newTitle;
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      const conversationID = action.payload;
      state.list!.conversations = state.list!.conversations.filter((c) => c.id !== conversationID);
      delete state.messages[conversationID];
      if (state.currentConversationID === conversationID) {
        state.currentConversationID = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  }
});

export default chatStateSlice.reducer;

export const {
  setPage,
  setPageSize,
  setList,
  setCurrentConversationID,
  setMessages,
  newConversation,
  appendMessage,
  appendStreamMessage,
  upsertMessage,
  confirmUserMessage,
  confirmAssistantMessage,
  updateMessageStatus,
  removeMessage,
  renameConversation,
  deleteConversation,
  updateConversation,
  setLoading,
  setError,
} = chatStateSlice.actions;
