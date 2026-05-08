import { MessageRecord, MessageStatus, PatchMessageRequest, RetryMessageRequest, SendMessageRequest, SendMessageResponse } from "../../api/ai";
import { patchMessage as patchMessageApi, sendRefreshToken } from "../../api/api";
import { ApiPrefix } from "../../api/request.ts";
import SessionManager from "../../session";
import { ErrNames } from "../../session/errors.ts";
import {
  appendMessage,
  appendStreamMessage,
  confirmAssistantMessage,
  confirmUserMessage,
  setError,
  setLoading,
  updateMessageStatus,
  upsertMessage,
} from "../chatSlice";
import { AppThunk } from "../store";
import { createConversation } from "./chat";

let currentAbortController: AbortController | null = null;

export const abortCurrentStream = () => {
  currentAbortController?.abort();
  currentAbortController = null;
};

export const isStreaming = () => currentAbortController !== null;

async function getAuthToken(dispatch: any): Promise<string> {
  try {
    return await SessionManager.getAccessToken();
  } catch (e) {
    if (e instanceof Error && e.name === ErrNames.ErrAccessTokenExpired) {
      const user = SessionManager.currentLogin();
      const newToken = await dispatch(sendRefreshToken({ refresh_token: user.token.refresh_token }));
      SessionManager.refreshToken(user.user.id, newToken);
      return newToken.access_token;
    }
    throw e;
  }
}

async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SendMessageResponse> {
  const decoder = new TextDecoder();
  let buffer = "";

  const tryYield = function* (raw: string) {
    const data = raw.trim();
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object" && ("send" in parsed || "receive" in parsed)) {
        yield parsed as SendMessageResponse;
      }
    } catch {
      console.warn("[SSE] Failed to parse chunk:", data);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let dataLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (dataLines.length > 0) {
          yield* tryYield(dataLines.join(""));
          dataLines = [];
        }
        continue;
      }

      if (trimmed.startsWith("data:")) {
        dataLines.push(trimmed.slice(5).trimStart());
      }
    }
  }

  if (buffer.trim()) {
    const data = buffer.trim().startsWith("data:") ? buffer.trim().slice(5).trimStart() : buffer.trim();
    yield* tryYield(data);
  }
}

export interface SendMessageOptions {
  use_context?: boolean;
  use_search?: boolean;
  attachment_urls?: string[];
  model_id?: string;
}

interface StreamActionOptions {
  conversationID: string;
  endpoint: string;
  body: SendMessageRequest | RetryMessageRequest;
  tempAssistantMsgId: string;
  tempUserMsgId?: string;
  onSend?: (message: MessageRecord) => void;
}

async function streamMessageAction(dispatch: any, options: StreamActionOptions) {
  const { conversationID, endpoint, body, tempAssistantMsgId, tempUserMsgId, onSend } = options;

  dispatch(setLoading(true));
  dispatch(setError(null));
  currentAbortController = new AbortController();
  let expectedSendId: string | null = null;
  let assistantMsgId: string | null = null;

  try {
    const token = await getAuthToken(dispatch);
    const response = await fetch(`${ApiPrefix}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: currentAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();

    for await (const chunk of parseSSEStream(reader)) {
      if (chunk.send) {
        const serverSendMsg: MessageRecord = {
          ...chunk.send,
          status: MessageStatus.Completed,
          use_context: body.use_context,
          use_search: body.use_search,
          model_id: body.model_id,
        };
        if (expectedSendId === null) {
          expectedSendId = serverSendMsg.id;
          if (tempUserMsgId) {
            dispatch(confirmUserMessage({ tempId: tempUserMsgId, confirmed: serverSendMsg }));
          } else {
            dispatch(upsertMessage(serverSendMsg));
          }
          onSend?.(serverSendMsg);
        } else if (serverSendMsg.id !== expectedSendId) {
          dispatch(setError("Stream integrity error: mismatched send ID"));
          currentAbortController?.abort();
          break;
        }
      }

      if (chunk.receive) {
        const serverReceiveMsg: MessageRecord = {
          ...chunk.receive,
          parent_send_id: expectedSendId ?? chunk.receive.parent_send_id,
          status: MessageStatus.Streaming,
        };
        if (assistantMsgId === null) {
          assistantMsgId = serverReceiveMsg.id;
          dispatch(confirmAssistantMessage({ tempId: tempAssistantMsgId, confirmed: serverReceiveMsg }));
        } else if (serverReceiveMsg.id === assistantMsgId) {
          dispatch(appendStreamMessage(serverReceiveMsg));
        } else {
          assistantMsgId = serverReceiveMsg.id;
          dispatch(appendMessage(serverReceiveMsg));
        }
      }
    }
    dispatch(updateMessageStatus({ conversationID, messageID: assistantMsgId ?? tempAssistantMsgId, status: MessageStatus.Completed }));
  } catch (e) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    const errorMessage = e instanceof Error ? e.message : "Unknown streaming error";
    if (!isAbort) {
      console.error("[SSE] Streaming error:", e);
      dispatch(setError(errorMessage));
    }
    dispatch(
      updateMessageStatus({
        conversationID,
        messageID: assistantMsgId ?? tempAssistantMsgId,
        status: isAbort ? MessageStatus.Canceled : MessageStatus.Failed,
        error_message: isAbort ? undefined : errorMessage,
      }),
    );
  } finally {
    currentAbortController = null;
    dispatch(setLoading(false));
  }
}

export function sendMessage(content: string, options?: SendMessageOptions): AppThunk {
  return async (dispatch, getState) => {
    if (!getState().chatState.currentConversationID) {
      await dispatch(createConversation({}));
    }

    const conversationID = getState().chatState.currentConversationID;
    if (!conversationID) {
      dispatch(setError("Failed to create conversation"));
      return;
    }

    const tempUserMsgId = `temp-send-${Date.now()}`;
    const tempAssistantMsgId = `temp-receive-${Date.now()}`;
    const optimisticUserMsg: MessageRecord = {
      id: tempUserMsgId,
      conversation_id: conversationID,
      type: "send",
      content,
      created_at: new Date().toISOString(),
      attachment_urls: options?.attachment_urls,
      status: MessageStatus.Sending,
      use_context: options?.use_context,
      use_search: options?.use_search,
      model_id: options?.model_id,
    };
    const optimisticAssistantMsg: MessageRecord = {
      id: tempAssistantMsgId,
      conversation_id: conversationID,
      type: "receive",
      content: "",
      created_at: new Date().toISOString(),
      parent_send_id: tempUserMsgId,
      status: MessageStatus.Streaming,
    };

    dispatch(appendMessage(optimisticUserMsg));
    dispatch(appendMessage(optimisticAssistantMsg));

    const messageArgs: SendMessageRequest = {
      content,
      conversation_id: conversationID,
      use_context: options?.use_context,
      use_search: options?.use_search,
      attachment_urls: options?.attachment_urls,
      model_id: options?.model_id,
    };

    await streamMessageAction(dispatch, {
      conversationID,
      endpoint: "/ai/chat/message/stream",
      body: messageArgs,
      tempAssistantMsgId,
      tempUserMsgId,
    });
  };
}

export function retryMessage(messageID: string, options?: Omit<SendMessageOptions, "attachment_urls">): AppThunk {
  return async (dispatch, getState) => {
    const conversationID = getState().chatState.currentConversationID;
    if (!conversationID) {
      return;
    }

    const tempAssistantMsgId = `temp-receive-retry-${Date.now()}`;
    dispatch(
      appendMessage({
        id: tempAssistantMsgId,
        conversation_id: conversationID,
        type: "receive",
        content: "",
        created_at: new Date().toISOString(),
        parent_send_id: messageID,
        status: MessageStatus.Streaming,
      }),
    );

    const retryArgs: RetryMessageRequest = {
      id: messageID,
      use_context: options?.use_context,
      use_search: options?.use_search,
      model_id: options?.model_id,
    };

    await streamMessageAction(dispatch, {
      conversationID,
      endpoint: `/ai/chat/message/${messageID}/retry/stream`,
      body: retryArgs,
      tempAssistantMsgId,
    });
  };
}

export function editMessage(args: PatchMessageRequest): AppThunk {
  return async (dispatch, getState) => {
    const conversationID = getState().chatState.currentConversationID;
    if (!conversationID) {
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await dispatch(patchMessageApi(args));
      if (result.send) {
        dispatch(
          upsertMessage({
            ...result.send,
            use_context: args.use_context,
            use_search: args.use_search,
            model_id: args.model_id,
          }),
        );
      }
      if (result.receive) {
        dispatch(
          appendMessage({
            ...result.receive,
            parent_send_id: result.send?.id ?? result.receive.parent_send_id,
            status: MessageStatus.Completed,
          }),
        );
      }
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Unknown error"));
    } finally {
      dispatch(setLoading(false));
    }
  };
}
