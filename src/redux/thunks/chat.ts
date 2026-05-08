import { AppThunk } from "../store";
import { ChatState, deleteConversation, newConversation, setList, setMessages, setPage, updateConversation } from "../chatSlice";
import { createChatConversation, deleteChatConversation, deleteMessage, deleteUnpinnedChatConversation, listConversationMessages, listChatConversations, updateChatConversation } from "../../api/api";
import { CreateChatConversationRequest, GetChatConversationResponse, ListConversactionRequest, ListConversationResponse, UpdateChatConversationRequest } from "../../api/ai";

const MinPageSize = 50;

export function loadConversations(filters?: Omit<ListConversactionRequest, "pagination">): AppThunk {
  return async (dispatch, getState) => {
    const { chatState } = getState();
    try {
      let listRes = await dispatch(listChatConversations({
        ...filters,
        pagination: {
          page_size: pageSize(chatState),
          page: chatState.list?.pagination.page ?? 1,
        }
      }));
      dispatch(setList(listRes));
      dispatch(setPage(listRes.pagination.page ?? 1));
    } catch (e) {
      console.log(e);
    }
  };
}

export function loadMessages(conversationID: string): AppThunk {
  return async (dispatch) => {
    try {
      const res = await dispatch(
        listConversationMessages({
          conversation_id: conversationID,
          pagination: { page_size: 100 },
        })
      );
      dispatch(setMessages({ conversationID, messages: res.messages }));
    } catch (e) {
      console.log(e);
    }
  };
}

export function deleteConversationThunk(id: string): AppThunk {
  return async (dispatch) => {
    try {
      await dispatch(deleteChatConversation(id));
      dispatch(deleteConversation(id));
    } catch (e) {
      console.error(e);
    }
  };
}

export function createConversation(args : CreateChatConversationRequest): AppThunk<Promise<GetChatConversationResponse>> {
  return async (dispatch, _getState) => {
    let conv = await dispatch(createChatConversation(args));
    dispatch(newConversation(conv));
    return conv;
  };
}

export function updateConversationThunk(args: UpdateChatConversationRequest): AppThunk<Promise<GetChatConversationResponse>> {
  return async (dispatch) => {
    const conv = await dispatch(updateChatConversation(args));
    dispatch(updateConversation(conv));
    return conv;
  };
}

const pageSize = (s: ChatState) => {
  let pageSize = Math.max(s.pageSize, MinPageSize);
  return Math.max(s.pageSize, s.list?.pagination.page_size ?? pageSize);
}

export function loadMoreConversations(): AppThunk {
  return async (dispatch, getState) => {
    const { chatState } = getState();
    dispatch(setPage(chatState.list?.pagination.page ?? 1));
    dispatch(loadConversations())
  }
}

export function clearUnpinnedConversationsThunk(): AppThunk {
  return async (dispatch) => {
    await dispatch(deleteUnpinnedChatConversation());
    dispatch(loadConversations());
  };
}

export function deleteMessageThunk(conversationID: string, messageID: string, cascade?: boolean): AppThunk {
  return async (dispatch) => {
    await dispatch(deleteMessage({ id: messageID, cascade }));
    dispatch(setMessages({
      conversationID,
      messages: [],
    }));
    dispatch(loadMessages(conversationID));
  };
}
