import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  FormLabel,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetKnowledgeResponse, GetModelResponse, GetRoleResponse, MessageRecord, MessageStatus, PatchMessageRequest } from "../../../api/ai.ts";
import { FileResponse, FileType } from "../../../api/explorer.ts";
import { getDefaultModel, getModel, listKnowledge, listModels, listRoles } from "../../../api/api.ts";
import { AiChatRoleModel } from "../../../api/dashboard.ts";
import { copyToClipboard } from "../../../util";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { setCurrentConversationID } from "../../../redux/chatSlice.ts";
import { confirmOperation } from "../../../redux/thunks/dialog.ts";
import { clearUnpinnedConversationsThunk, createConversation, deleteConversationThunk, deleteMessageThunk, loadConversations, loadMessages, updateConversationThunk } from "../../../redux/thunks/chat.ts";
import { abortCurrentStream, editMessage, isStreaming, retryMessage, sendMessage } from "../../../redux/thunks/sendMessage.ts";
import { getFileLinkedUri } from "../../../util";
import ChatAttachmentList from "./ChatAttachmentList.tsx";
import ChatRichText from "./ChatRichText.tsx";
import RoleAvatar from "../../Common/Ai/Role/RoleAvatar.tsx";
import Add from "../../Icons/Add.tsx";
import ArrowSync from "../../Icons/ArrowSync.tsx";
import Bot from "../../Icons/Bot.tsx";
import Delete from "../../Icons/Delete.tsx";
import Dismiss from "../../Icons/Dismiss.tsx";
import Document from "../../Icons/Document.tsx";
import Globe from "../../Icons/Globe.tsx";
import MoreHorizontal from "../../Icons/MoreHorizontal.tsx";
import PinOutlined from "../../Icons/PinOutlined.tsx";
import RenameOutlined from "../../Icons/RenameOutlined.tsx";
import Search from "../../Icons/Search.tsx";
import Send from "../../Icons/Send.tsx";
import SettingsOutlined from "../../Icons/SettingsOutlined.tsx";
import Sparkle from "../../Icons/Sparkle.tsx";
import Edit from "../../Icons/Edit.tsx";

const defaultTemperature = 0.7;
const defaultMaxTokens = 4096;
const defaultMaxContexts = 6;
const untitledConversationNames = new Set(["", "新对话", "Untitled", "未命名对话"]);

const asArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const ensureModel = (models: GetModelResponse[] | null | undefined, nextModel?: GetModelResponse | null) => {
  const safeModels = asArray(models);

  if (!nextModel) {
    return safeModels;
  }

  if (safeModels.some((model) => model.id === nextModel.id)) {
    return safeModels;
  }

  return [nextModel, ...safeModels];
};

const toRoleAvatarModel = (role?: GetRoleResponse): AiChatRoleModel | undefined => {
  if (!role) {
    return undefined;
  }

  return {
    id: 0,
    name: role.name,
    avatar: role.avatar,
    description: role.description,
    category: role.category,
    system_message: role.system_message,
    mcp_client_names: role.mcp_client_names,
  };
};

const buildSuggestedTitle = (content?: string) => {
  const plain = (content ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  return plain.length > 18 ? `${plain.slice(0, 18).trim()}...` : plain;
};

const buildQuotedMessage = (message: MessageRecord) => {
  const content = message.content?.trim() || "";
  if (!content) {
    return "";
  }

  return content
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
};

interface ConversationTurn {
  key: string;
  send?: MessageRecord;
  responses: MessageRecord[];
}

const buildConversationTurns = (messages: MessageRecord[]): ConversationTurn[] => {
  const turns: ConversationTurn[] = [];
  const turnBySendId = new Map<string, ConversationTurn>();
  let latestSendTurn: ConversationTurn | null = null;

  messages.forEach((message) => {
    if (message.type === "send") {
      const turn: ConversationTurn = {
        key: message.id,
        send: message,
        responses: [],
      };
      turns.push(turn);
      turnBySendId.set(message.id, turn);
      latestSendTurn = turn;
      return;
    }

    if (message.reply_id) {
      const parentTurn = turnBySendId.get(message.reply_id);
      if (parentTurn) {
        parentTurn.responses.push(message);
        return;
      }
    }

    if (latestSendTurn) {
      latestSendTurn.responses.push(message);
      return;
    }

    turns.push({
      key: `receive-${message.id}`,
      responses: [message],
    });
  });

  return turns;
};

interface MessageCardProps {
  msg: MessageRecord;
  sourceMessage?: MessageRecord;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, message: MessageRecord) => void;
}

interface RagSourceExplanationProps {
  send?: MessageRecord;
  response: MessageRecord;
}

const sourcePreviewLimit = 180;
const maxSegmentsPerDocument = 2;

const truncateSourceText = (value?: string, limit = sourcePreviewLimit) => {
  const plain = (value ?? "").replace(/\s+/g, " ").trim();
  if (!plain || plain.length <= limit) {
    return plain;
  }

  return `${plain.slice(0, limit).trim()}...`;
};

const getWebSourceHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const groupKnowledgeSegments = (segments: NonNullable<MessageRecord["segments"]>) => {
  const groups = new Map<string, { key: string; title: string; segments: NonNullable<MessageRecord["segments"]> }>();
  segments.forEach((segment) => {
    const key = segment.document_id || segment.document_name || segment.id;
    const current = groups.get(key) ?? {
      key,
      title: segment.document_name || segment.document_id || key,
      segments: [],
    };
    current.segments.push(segment);
    groups.set(key, current);
  });

  return Array.from(groups.values());
};

const RagSourceExplanation = ({ send, response }: RagSourceExplanationProps) => {
  const { t } = useTranslation("application");
  const segments = response.segments ?? [];
  const webPages = response.web_pages ?? [];
  const attachments = send?.attachment_urls ?? [];
  const knowledgeGroups = groupKnowledgeSegments(segments);
  const knowledgeRequested = send?.use_context === true || segments.length > 0;
  const webRequested = send?.use_search === true || webPages.length > 0;
  const hasAnySource = knowledgeRequested || webRequested || segments.length > 0 || webPages.length > 0 || attachments.length > 0;

  if (!hasAnySource) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ mt: 1.5, p: 1.25, bgcolor: "action.hover" }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {t("ai.sourceExplanation")}
          </Typography>
          <Chip
            size="small"
            color={segments.length > 0 ? "success" : knowledgeRequested ? "default" : "default"}
            variant={segments.length > 0 ? "filled" : "outlined"}
            label={t(segments.length > 0 ? "ai.knowledgeSourceUsed" : knowledgeRequested ? "ai.knowledgeSourceNoHit" : "ai.knowledgeSourceOff", {
              count: segments.length,
            })}
          />
          <Chip
            size="small"
            color={webPages.length > 0 ? "info" : "default"}
            variant={webPages.length > 0 ? "filled" : "outlined"}
            label={t(webPages.length > 0 ? "ai.webSourceUsed" : webRequested ? "ai.webSourceNoHit" : "ai.webSourceOff", {
              count: webPages.length,
            })}
          />
          {attachments.length > 0 && (
            <Chip size="small" variant="outlined" label={t("ai.attachmentSourceUsed", { count: attachments.length })} />
          )}
        </Stack>

        {attachments.length > 0 && (
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              {t("ai.attachmentSources")}
            </Typography>
            <ChatAttachmentList attachments={attachments} />
          </Stack>
        )}

        {segments.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {t("ai.knowledgeReferences")}
            </Typography>
            {knowledgeGroups.map((group) => (
              <Paper key={group.key} variant="outlined" sx={{ p: 1.25, bgcolor: "background.paper" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Document sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {group.title}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={t("ai.sourceSegmentCount", { count: group.segments.length })}
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>

                  <Stack spacing={0.75}>
                    {group.segments.slice(0, maxSegmentsPerDocument).map((segment, index) => (
                      <Box key={segment.id} sx={{ borderLeft: (theme) => `2px solid ${theme.palette.divider}`, pl: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
                          {t("ai.sourceSegmentIndex", { index: index + 1 })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {truncateSourceText(segment.content)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {group.segments.length > maxSegmentsPerDocument && (
                    <Typography variant="caption" color="text.secondary">
                      {t("ai.moreSourceSegments", { count: group.segments.length - maxSegmentsPerDocument })}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {webPages.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {t("ai.webReferences")}
            </Typography>
            {webPages.map((page, index) => (
              <Paper key={`${page.url}-${index}`} variant="outlined" sx={{ p: 1.25, bgcolor: "background.paper" }}>
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {page.icon ? (
                        <Box component="img" src={page.icon} alt="" sx={{ width: 16, height: 16 }} />
                      ) : (
                        <Globe sx={{ fontSize: 16, color: "text.secondary" }} />
                      )}
                    </Box>
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography
                        component="a"
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600 }}
                      >
                        {page.title || page.name || getWebSourceHost(page.url)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {page.name || getWebSourceHost(page.url)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {(page.summary || page.snippet) && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {truncateSourceText(page.summary || page.snippet)}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                    {page.url}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

const MessageCard = ({ msg, sourceMessage, onOpenMenu }: MessageCardProps) => {
  const { t } = useTranslation("application");
  const isUser = msg.type === "send";
  const theme = useTheme();
  const isFailed = msg.status === MessageStatus.Failed;
  const isCanceled = msg.status === MessageStatus.Canceled;
  const isStreamingPlaceholder =
    !isUser &&
    msg.status === MessageStatus.Streaming &&
    !msg.content &&
    !msg.reason_content &&
    (!msg.attachment_urls || msg.attachment_urls.length === 0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 1.5,
        mb: 2,
        px: 2,
      }}
    >
      <Box sx={{ pt: 0.5 }}>
        {isUser ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            U
          </Box>
        ) : (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: theme.palette.action.hover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot sx={{ fontSize: 18 }} />
          </Box>
        )}
      </Box>
      <Box sx={{ maxWidth: "82%" }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
            color: isUser ? "#fff" : theme.palette.text.primary,
            borderRadius: 2,
            border: isUser ? "none" : `1px solid ${isFailed ? theme.palette.error.light : theme.palette.divider}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: isStreamingPlaceholder ? 0 : 0.5 }}>
            <Typography variant="caption" sx={{ color: isUser ? "rgba(255,255,255,0.75)" : "text.secondary" }}>
              {isUser ? t("ai.you") : t("ai.assistant")}
            </Typography>
            <IconButton
              size="small"
              onClick={(event) => onOpenMenu(event, msg)}
              sx={{
                color: isUser ? "rgba(255,255,255,0.82)" : "text.secondary",
                mt: -0.75,
                mr: -0.75,
              }}
            >
              <MoreHorizontal sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {isStreamingPlaceholder && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
              <CircularProgress size={14} />
              <Typography variant="caption">{t("ai.thinking")}</Typography>
            </Stack>
          )}

          {msg.status && msg.status !== MessageStatus.Completed && !isStreamingPlaceholder && (
            <Chip
              size="small"
              color={isFailed ? "error" : isCanceled ? "default" : "info"}
              variant="outlined"
              label={t(`ai.messageStatus.${msg.status}`)}
              sx={{ mb: msg.content || msg.reason_content ? 1 : 0 }}
            />
          )}

          {isFailed && msg.error_message && (
            <Alert severity="error" sx={{ mb: msg.content || msg.reason_content ? 1 : 0 }}>
              {msg.error_message}
            </Alert>
          )}

          {msg.reason_content && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                color: isUser ? "rgba(255,255,255,0.82)" : "text.secondary",
                fontStyle: "italic",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.reason_content}
            </Typography>
          )}

          {!isStreamingPlaceholder && <ChatRichText content={msg.content} color={isUser ? "#fff" : undefined} />}

          <Box sx={{ mt: msg.content || msg.reason_content ? 1.25 : 0 }}>
            <ChatAttachmentList attachments={msg.attachment_urls} />
          </Box>

          {!isUser && <RagSourceExplanation send={sourceMessage} response={msg} />}
        </Paper>
      </Box>
    </Box>
  );
};

interface AssistantVersionGroupProps {
  turnKey: string;
  send?: MessageRecord;
  responses: MessageRecord[];
  selectedVersion: number;
  onSelectVersion: (turnKey: string, index: number) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, message: MessageRecord) => void;
}

const AssistantVersionGroup = ({
  turnKey,
  send,
  responses,
  selectedVersion,
  onSelectVersion,
  onOpenMenu,
}: AssistantVersionGroupProps) => {
  const { t } = useTranslation("application");

  if (responses.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(selectedVersion, 0), responses.length - 1);
  const activeResponse = responses[safeIndex];

  return (
    <Box sx={{ mb: 2 }}>
      <MessageCard msg={activeResponse} sourceMessage={send} onOpenMenu={onOpenMenu} />
      {responses.length > 1 && (
        <Stack direction="row" spacing={1} justifyContent="flex-start" sx={{ pl: 6.5, mt: -1 }}>
          {responses.map((response, index) => (
            <Chip
              key={response.id}
              size="small"
              color={index === safeIndex ? "primary" : "default"}
              variant={index === safeIndex ? "filled" : "outlined"}
              label={t("ai.replyVersionLabel", { index: index + 1 })}
              onClick={() => onSelectVersion(turnKey, index)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export interface ChatTabProps {
  draftKnowledgeId?: string | null;
  onDraftKnowledgeApplied?: () => void;
}

const ChatTab = ({ draftKnowledgeId, onDraftKnowledgeApplied }: ChatTabProps) => {
  const { t } = useTranslation("application");
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const chatState = useAppSelector((state) => state.chatState);
  const fileSelections = useAppSelector((state) => Object.values(state.fileManager?.[0]?.selected ?? {}) as FileResponse[]);
  const conversations = asArray(chatState.list?.conversations);
  const currentID = chatState.currentConversationID;
  const messages = currentID ? asArray(chatState.messages[currentID]) : [];
  const loading = chatState.loading;
  const error = chatState.error;

  const [input, setInput] = useState("");
  const [showConvList, setShowConvList] = useState(!isMobile);
  const [roles, setRoles] = useState<GetRoleResponse[]>([]);
  const [knowledges, setKnowledges] = useState<GetKnowledgeResponse[]>([]);
  const [models, setModels] = useState<GetModelResponse[]>([]);
  const [defaultModel, setDefaultModel] = useState<GetModelResponse | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(undefined);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string>("");
  const [useContext, setUseContext] = useState(true);
  const [useSearch, setUseSearch] = useState(false);
  const [composerMode, setComposerMode] = useState<"plain" | "knowledge" | "hybrid" | "web">("knowledge");
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSystemMessage, setDraftSystemMessage] = useState("");
  const [draftModelId, setDraftModelId] = useState("");
  const [draftTemperature, setDraftTemperature] = useState(defaultTemperature);
  const [draftMaxTokens, setDraftMaxTokens] = useState(defaultMaxTokens);
  const [draftMaxContexts, setDraftMaxContexts] = useState(defaultMaxContexts);
  const [draftPinned, setDraftPinned] = useState(false);
  const [draftAttachments, setDraftAttachments] = useState<FileResponse[]>([]);
  const [conversationKeyword, setConversationKeyword] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [managingConversation, setManagingConversation] = useState(false);
  const [conversationMenuAnchor, setConversationMenuAnchor] = useState<null | HTMLElement>(null);
  const [conversationMenuTargetId, setConversationMenuTargetId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState("");
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [messageMenuTarget, setMessageMenuTarget] = useState<MessageRecord | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [selectedResponseVersions, setSelectedResponseVersions] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const autoTitledConversationIds = useRef<Record<string, boolean>>({});

  const currentConv = conversations.find((conversation) => conversation.id === currentID);
  const conversationMenuTarget = conversations.find((conversation) => conversation.id === conversationMenuTargetId);
  const selectedKnowledge = useMemo(
    () => knowledges.find((knowledge) => knowledge.id === selectedKnowledgeId),
    [knowledges, selectedKnowledgeId],
  );
  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
  const currentModel = useMemo(() => models.find((model) => model.id === draftModelId) ?? defaultModel, [defaultModel, draftModelId, models]);
  const selectableFiles = useMemo(
    () => fileSelections.filter((file) => file.type === FileType.file),
    [fileSelections],
  );
  const pinnedConversations = useMemo(() => conversations.filter((conversation) => conversation.pinned), [conversations]);
  const recentConversations = useMemo(() => conversations.filter((conversation) => !conversation.pinned), [conversations]);
  const conversationTurns = useMemo(() => buildConversationTurns(messages), [messages]);

  const applyModelPreset = useCallback((model?: GetModelResponse | null) => {
    if (!model) {
      return;
    }

    setDraftModelId(model.id);
    setDraftTemperature(model.temperature ?? defaultTemperature);
    setDraftMaxTokens(model.max_tokens ?? defaultMaxTokens);
    setDraftMaxContexts(model.max_contexts ?? defaultMaxContexts);
  }, []);

  useEffect(() => {
    setShowConvList(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    dispatch(listRoles({ is_public: true, pagination: { page_size: 100 } }))
      .then((res) => setRoles(asArray(res?.roles)))
      .catch(() => undefined);
    dispatch(listKnowledge({ pagination: { page_size: 100 } }))
      .then((res) => setKnowledges(asArray(res?.knowledges)))
      .catch(() => undefined);
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConversationSearch(conversationKeyword.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [conversationKeyword]);

  useEffect(() => {
    dispatch(loadConversations(conversationSearch ? { title: conversationSearch } : undefined));
  }, [conversationSearch, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadModelOptions = async () => {
      setModelsLoading(true);

      const [listRes, defaultRes] = await Promise.allSettled([
        dispatch(listModels({ pagination: { page: 1, page_size: 100 } })),
        dispatch(getDefaultModel("chat")),
      ]);

      if (cancelled) {
        return;
      }

      let nextModels: GetModelResponse[] = [];
      let nextDefault: GetModelResponse | null = null;

      if (listRes.status === "fulfilled") {
        nextModels = asArray(listRes.value?.models);
      }

      if (defaultRes.status === "fulfilled") {
        nextDefault = defaultRes.value ?? null;
        nextModels = ensureModel(nextModels, nextDefault);
      }

      setModels(asArray(nextModels));
      setDefaultModel(nextDefault);
      setModelsLoading(false);
    };

    loadModelOptions().catch(() => {
      if (!cancelled) {
        setModelsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!currentConv?.model_id) {
      return;
    }

    if (models.some((model) => model.id === currentConv.model_id)) {
      return;
    }

    dispatch(getModel(currentConv.model_id))
      .then((model) => {
        setModels((prev) => ensureModel(prev, model));
      })
      .catch(() => undefined);
  }, [currentConv?.model_id, dispatch, models]);

  useEffect(() => {
    if (currentID) {
      dispatch(loadMessages(currentID));
    }
  }, [currentID, dispatch]);

  useEffect(() => {
    if (!currentConv || !currentID || autoTitledConversationIds.current[currentID]) {
      return;
    }

    if (!untitledConversationNames.has(currentConv.title || "")) {
      autoTitledConversationIds.current[currentID] = true;
      return;
    }

    const firstUserMessage = messages.find((message) => message.type === "send" && message.content?.trim());
    if (!firstUserMessage) {
      return;
    }

    const suggestedTitle = buildSuggestedTitle(firstUserMessage.content);
    if (!suggestedTitle) {
      return;
    }

    autoTitledConversationIds.current[currentID] = true;
    dispatch(
      updateConversationThunk({
        id: currentID,
        title: suggestedTitle,
      }),
    ).catch(() => {
      delete autoTitledConversationIds.current[currentID];
    });
  }, [currentConv, currentID, dispatch, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setSelectedResponseVersions((prev) => {
      const next = { ...prev };
      conversationTurns.forEach((turn) => {
        if (turn.responses.length > 0 && (next[turn.key] === undefined || next[turn.key] > turn.responses.length - 1)) {
          next[turn.key] = turn.responses.length - 1;
        }
      });
      return next;
    });
  }, [conversationTurns]);

  useEffect(() => {
    if (!draftKnowledgeId) {
      return;
    }

    setSelectedKnowledgeId(draftKnowledgeId);
    dispatch(createConversation({ role_id: selectedRoleId, knowledge_id: draftKnowledgeId, model_id: draftModelId || defaultModel?.id || undefined }));
    if (isMobile) {
      setShowConvList(false);
    }
    onDraftKnowledgeApplied?.();
  }, [defaultModel?.id, dispatch, draftKnowledgeId, draftModelId, isMobile, onDraftKnowledgeApplied, selectedRoleId]);

  useEffect(() => {
    if (!currentConv) {
      setDraftTitle("");
      setDraftSystemMessage("");
      setDraftPinned(false);
      if (defaultModel) {
        applyModelPreset(defaultModel);
      } else {
        setDraftModelId("");
        setDraftTemperature(defaultTemperature);
        setDraftMaxTokens(defaultMaxTokens);
        setDraftMaxContexts(defaultMaxContexts);
      }
      return;
    }

    setDraftTitle(currentConv.title || "");
    setDraftSystemMessage(currentConv.system_message || "");
    setDraftModelId(currentConv.model_id || defaultModel?.id || "");
    setDraftTemperature(currentConv.temperature ?? defaultModel?.temperature ?? defaultTemperature);
    setDraftMaxTokens(currentConv.max_tokens ?? defaultModel?.max_tokens ?? defaultMaxTokens);
    setDraftMaxContexts(currentConv.max_contexts ?? defaultModel?.max_contexts ?? defaultMaxContexts);
    setDraftPinned(currentConv.pinned);
  }, [applyModelPreset, currentConv, defaultModel]);

  useEffect(() => {
    if (composerMode === "plain") {
      setUseContext(false);
      setUseSearch(false);
    } else if (composerMode === "knowledge") {
      setUseContext(true);
      setUseSearch(false);
    } else if (composerMode === "hybrid") {
      setUseContext(true);
      setUseSearch(true);
    } else if (composerMode === "web") {
      setUseContext(false);
      setUseSearch(true);
    }
  }, [composerMode]);

  const handleModelChange = useCallback(
    async (event: SelectChangeEvent<string>) => {
      const nextModelId = event.target.value;
      setDraftModelId(nextModelId);

      if (!nextModelId) {
        applyModelPreset(defaultModel);
        return;
      }

      const cached = models.find((model) => model.id === nextModelId);
      if (cached) {
        applyModelPreset(cached);
        return;
      }

      try {
        const detail = await dispatch(getModel(nextModelId));
        setModels((prev) => ensureModel(prev, detail));
        applyModelPreset(detail);
      } catch {
        setDraftModelId(nextModelId);
      }
    },
    [applyModelPreset, defaultModel, dispatch, models],
  );

  const handleSend = useCallback(async () => {
    const content = input.trim();
    const attachmentUrls = asArray(draftAttachments).map((file) => getFileLinkedUri(file));

    if ((!content && attachmentUrls.length === 0) || isStreaming()) {
      return;
    }

    if (editingMessageId) {
      const editArgs: PatchMessageRequest = {
        id: editingMessageId,
        content,
        use_context: useContext,
        use_search: useSearch,
        model_id: draftModelId || defaultModel?.id || undefined,
      };
      dispatch(editMessage(editArgs));
      setEditingMessageId(null);
      setInput("");
      setDraftAttachments([]);
      return;
    }

    if (!currentID) {
      await dispatch(
        createConversation({
          role_id: selectedRoleId,
          knowledge_id: selectedKnowledgeId || undefined,
          model_id: draftModelId || defaultModel?.id || undefined,
        }),
      );
    }

    dispatch(
      sendMessage(content, {
        use_context: useContext,
        use_search: useSearch,
        model_id: draftModelId || defaultModel?.id || undefined,
        attachment_urls: attachmentUrls,
      }),
    );
    setInput("");
    setDraftAttachments([]);
  }, [currentID, defaultModel?.id, dispatch, draftAttachments, draftModelId, editingMessageId, input, selectedKnowledgeId, selectedRoleId, useContext, useSearch]);

  const handleNewChat = useCallback(() => {
    dispatch(
      createConversation({
        role_id: selectedRoleId,
        knowledge_id: selectedKnowledgeId || undefined,
        model_id: draftModelId || defaultModel?.id || undefined,
      }),
    );
    if (isMobile) {
      setShowConvList(false);
    }
  }, [defaultModel?.id, dispatch, draftModelId, isMobile, selectedKnowledgeId, selectedRoleId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      dispatch(setCurrentConversationID(id));
      if (isMobile) {
        setShowConvList(false);
      }
    },
    [dispatch, isMobile],
  );

  const handleKnowledgeChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedKnowledgeId(event.target.value);
  }, []);

  const handleSaveConfig = useCallback(async () => {
    if (!currentID) return;
    setSavingConfig(true);
    try {
      await dispatch(
        updateConversationThunk({
          id: currentID,
          title: draftTitle || undefined,
          pinned: draftPinned,
          system_message: draftSystemMessage || undefined,
          model_id: draftModelId || defaultModel?.id || undefined,
          temperature: draftTemperature,
          max_tokens: draftMaxTokens,
          max_contexts: draftMaxContexts,
        }),
      );
      setShowConfig(false);
    } finally {
      setSavingConfig(false);
    }
  }, [currentID, defaultModel?.id, dispatch, draftMaxContexts, draftMaxTokens, draftModelId, draftPinned, draftSystemMessage, draftTemperature, draftTitle]);

  const resetConfig = useCallback(() => {
    if (!currentConv) {
      applyModelPreset(defaultModel);
      setDraftTitle("");
      setDraftSystemMessage("");
      setDraftPinned(false);
      return;
    }

    setDraftTitle(currentConv.title || "");
    setDraftSystemMessage(currentConv.system_message || "");
    setDraftModelId(currentConv.model_id || defaultModel?.id || "");
    setDraftTemperature(currentConv.temperature ?? defaultModel?.temperature ?? defaultTemperature);
    setDraftMaxTokens(currentConv.max_tokens ?? defaultModel?.max_tokens ?? defaultMaxTokens);
    setDraftMaxContexts(currentConv.max_contexts ?? defaultModel?.max_contexts ?? defaultMaxContexts);
    setDraftPinned(currentConv.pinned);
  }, [applyModelPreset, currentConv, defaultModel]);

  const handleAttachSelectedFiles = useCallback(() => {
    if (!selectableFiles.length) {
      return;
    }

    setDraftAttachments((prev) => {
      const next = [...prev];
      selectableFiles.forEach((file) => {
        if (!next.some((item) => getFileLinkedUri(item) === getFileLinkedUri(file))) {
          next.push(file);
        }
      });
      return next;
    });
  }, [selectableFiles]);

  const handleRemoveAttachment = useCallback((url: string) => {
    setDraftAttachments((prev) => prev.filter((file) => getFileLinkedUri(file) !== url));
  }, []);

  const handleOpenConversationMenu = useCallback((event: React.MouseEvent<HTMLElement>, conversationId: string) => {
    event.stopPropagation();
    setConversationMenuAnchor(event.currentTarget);
    setConversationMenuTargetId(conversationId);
  }, []);

  const handleCloseConversationMenu = useCallback(() => {
    setConversationMenuAnchor(null);
    setConversationMenuTargetId(null);
  }, []);

  const handleOpenMessageMenu = useCallback((event: React.MouseEvent<HTMLElement>, message: MessageRecord) => {
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setMessageMenuTarget(message);
  }, []);

  const handleCloseMessageMenu = useCallback(() => {
    setMessageMenuAnchor(null);
    setMessageMenuTarget(null);
  }, []);

  const handleSelectResponseVersion = useCallback((turnKey: string, index: number) => {
    setSelectedResponseVersions((prev) => ({
      ...prev,
      [turnKey]: index,
    }));
  }, []);

  const handleStartRenameConversation = useCallback((conversationId: string, title?: string) => {
    setRenamingConversationId(conversationId);
    setRenamingTitle(title || "");
    handleCloseConversationMenu();
  }, [handleCloseConversationMenu]);

  const handleRenameConversation = useCallback(async () => {
    if (!renamingConversationId) {
      return;
    }

    const nextTitle = renamingTitle.trim();
    if (!nextTitle) {
      setRenamingConversationId(null);
      setRenamingTitle("");
      return;
    }

    try {
      await dispatch(
        updateConversationThunk({
          id: renamingConversationId,
          title: nextTitle,
        }),
      );
    } finally {
      setRenamingConversationId(null);
      setRenamingTitle("");
    }
  }, [dispatch, renamingConversationId, renamingTitle]);

  const handleToggleConversationPin = useCallback(async () => {
    if (!conversationMenuTarget) {
      return;
    }

    try {
      await dispatch(
        updateConversationThunk({
          id: conversationMenuTarget.id,
          pinned: !conversationMenuTarget.pinned,
        }),
      );
    } finally {
      handleCloseConversationMenu();
    }
  }, [conversationMenuTarget, dispatch, handleCloseConversationMenu]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      await dispatch(confirmOperation(t("ai.confirmDeleteConversation")));
      await dispatch(deleteConversationThunk(conversationId));
    } catch {
      return;
    } finally {
      handleCloseConversationMenu();
    }
  }, [dispatch, handleCloseConversationMenu, t]);

  const handleQuoteMessage = useCallback(() => {
    if (!messageMenuTarget) {
      return;
    }

    const quoted = buildQuotedMessage(messageMenuTarget);
    if (!quoted) {
      handleCloseMessageMenu();
      return;
    }

    setInput((prev) => {
      const next = prev.trim();
      return next ? `${next}\n\n${quoted}\n` : `${quoted}\n`;
    });
    handleCloseMessageMenu();
  }, [handleCloseMessageMenu, messageMenuTarget]);

  const handleCopyMessage = useCallback(() => {
    if (!messageMenuTarget?.content?.trim()) {
      handleCloseMessageMenu();
      return;
    }

    copyToClipboard(messageMenuTarget.content);
    handleCloseMessageMenu();
  }, [handleCloseMessageMenu, messageMenuTarget]);

  const handleResendMessage = useCallback(() => {
    if (!messageMenuTarget || messageMenuTarget.type !== "send" || isStreaming()) {
      handleCloseMessageMenu();
      return;
    }

    setSelectedResponseVersions((prev) => ({
      ...prev,
      [messageMenuTarget.id]: Math.max(prev[messageMenuTarget.id] ?? 0, 9999),
    }));
    dispatch(
      retryMessage(messageMenuTarget.id, {
        use_context: useContext,
        use_search: useSearch,
        model_id: draftModelId || defaultModel?.id || undefined,
      }),
    );
    handleCloseMessageMenu();
  }, [defaultModel?.id, dispatch, draftModelId, handleCloseMessageMenu, messageMenuTarget, useContext, useSearch]);

  const handleStartEditMessage = useCallback(() => {
    if (!messageMenuTarget || messageMenuTarget.type !== "send") {
      handleCloseMessageMenu();
      return;
    }

    setEditingMessageId(messageMenuTarget.id);
    setInput(messageMenuTarget.content || "");
    handleCloseMessageMenu();
  }, [handleCloseMessageMenu, messageMenuTarget]);

  const handleDeleteMessage = useCallback(async () => {
    if (!messageMenuTarget || !currentID) {
      return;
    }

    try {
      await dispatch(confirmOperation(t("ai.confirmDeleteMessage")));
      await dispatch(deleteMessageThunk(currentID, messageMenuTarget.id, messageMenuTarget.type === "send"));
    } catch {
      return;
    } finally {
      handleCloseMessageMenu();
    }
  }, [currentID, dispatch, handleCloseMessageMenu, messageMenuTarget, t]);

  const handleClearContext = useCallback(async () => {
    if (isStreaming()) {
      abortCurrentStream();
    }

    setManagingConversation(true);
    try {
      if (currentID) {
        await dispatch(confirmOperation(t("ai.confirmClearContext")));
      }

      const nextConversation = await dispatch(
        createConversation({
          role_id: selectedRoleId,
          knowledge_id: selectedKnowledgeId || undefined,
          model_id: draftModelId || defaultModel?.id || undefined,
        }),
      );

      await dispatch(
        updateConversationThunk({
          id: nextConversation.id,
          title: draftTitle || undefined,
          pinned: draftPinned,
          system_message: draftSystemMessage || undefined,
          model_id: draftModelId || defaultModel?.id || undefined,
          temperature: draftTemperature,
          max_tokens: draftMaxTokens,
          max_contexts: draftMaxContexts,
        }),
      );

      setInput("");
      setDraftAttachments([]);
    } catch {
      return;
    } finally {
      setManagingConversation(false);
    }
  }, [currentID, defaultModel?.id, dispatch, draftMaxContexts, draftMaxTokens, draftModelId, draftPinned, draftSystemMessage, draftTemperature, draftTitle, selectedKnowledgeId, selectedRoleId, t]);

  const handleClearUnpinned = useCallback(async () => {
    try {
      await dispatch(confirmOperation(t("ai.confirmClearUnpinnedConversations")));
      setManagingConversation(true);
      await dispatch(clearUnpinnedConversationsThunk());
    } catch {
      return;
    } finally {
      setManagingConversation(false);
    }
  }, [dispatch, t]);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {(!isMobile || showConvList) && (
        <Paper
          elevation={0}
          sx={{
            width: isMobile ? "100%" : 300,
            height: "100%",
            borderRight: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
          }}
        >
          <Box sx={{ p: 2, display: "flex", gap: 1 }}>
            <Button variant="contained" fullWidth startIcon={<Add />} onClick={handleNewChat} size="small">
              {t("ai.newChat")}
            </Button>
            {isMobile && (
              <IconButton onClick={() => setShowConvList(false)} size="small">
                <Dismiss />
              </IconButton>
            )}
          </Box>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={t("ai.searchConversations")}
              value={conversationKeyword}
              onChange={(event) => setConversationKeyword(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Button size="small" fullWidth variant="text" onClick={handleClearUnpinned} disabled={managingConversation}>
              {t("ai.clearUnpinnedConversations")}
            </Button>
          </Box>
          <Divider />
          <List dense sx={{ overflow: "auto", flex: 1 }}>
            {conversations.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={conversationSearch ? t("ai.noConversationSearchResults") : t("ai.noConversations")}
                  secondary={conversationSearch ? t("ai.tryDifferentConversationKeyword") : undefined}
                />
              </ListItem>
            )}
            {pinnedConversations.length > 0 && (
              <ListItem>
                <ListItemText primary={t("ai.pinnedConversations")} primaryTypographyProps={{ variant: "caption", color: "text.secondary" }} />
              </ListItem>
            )}
            {pinnedConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PinOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
                    <IconButton edge="end" size="small" onClick={(event) => handleOpenConversationMenu(event, conversation.id)}>
                      <MoreHorizontal fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemButton selected={conversation.id === currentID} onClick={() => handleSelectConversation(conversation.id)}>
                  {renamingConversationId === conversation.id ? (
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      value={renamingTitle}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setRenamingTitle(event.target.value)}
                      onBlur={handleRenameConversation}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleRenameConversation();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setRenamingConversationId(null);
                          setRenamingTitle("");
                        }
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={conversation.title || t("ai.untitledChat")}
                      secondary={conversation.model}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
            {recentConversations.length > 0 && (
              <ListItem>
                <ListItemText primary={t("ai.recentConversations")} primaryTypographyProps={{ variant: "caption", color: "text.secondary" }} />
              </ListItem>
            )}
            {recentConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton edge="end" size="small" onClick={(event) => handleOpenConversationMenu(event, conversation.id)}>
                      <MoreHorizontal fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemButton selected={conversation.id === currentID} onClick={() => handleSelectConversation(conversation.id)}>
                  {renamingConversationId === conversation.id ? (
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      value={renamingTitle}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setRenamingTitle(event.target.value)}
                      onBlur={handleRenameConversation}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleRenameConversation();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setRenamingConversationId(null);
                          setRenamingTitle("");
                        }
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={conversation.title || t("ai.untitledChat")}
                      secondary={conversation.model}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Menu anchorEl={conversationMenuAnchor} open={Boolean(conversationMenuAnchor)} onClose={handleCloseConversationMenu}>
            <MenuItem onClick={() => conversationMenuTarget && handleStartRenameConversation(conversationMenuTarget.id, conversationMenuTarget.title)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RenameOutlined sx={{ fontSize: 18 }} />
                {t("ai.renameConversation")}
              </Box>
            </MenuItem>
            <MenuItem onClick={handleToggleConversationPin}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PinOutlined sx={{ fontSize: 18 }} />
                {conversationMenuTarget?.pinned ? t("ai.unpinConversation") : t("ai.pinConversation")}
              </Box>
            </MenuItem>
            <MenuItem onClick={() => conversationMenuTarget && handleDeleteConversation(conversationMenuTarget.id)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Delete sx={{ fontSize: 18 }} />
                {t("ai.deleteConversation")}
              </Box>
            </MenuItem>
          </Menu>
        </Paper>
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {isMobile && !showConvList && (
              <Button size="small" onClick={() => setShowConvList(true)}>
                {t("ai.conversations")}
              </Button>
            )}
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {currentConv?.title || t("ai.chat")}
            </Typography>
            {selectedKnowledge && <Chip size="small" color="primary" variant="outlined" label={selectedKnowledge.name} />}
            {currentModel && <Chip size="small" variant="outlined" label={currentModel.name} />}
            <Button size="small" variant="text" startIcon={<Sparkle />} onClick={handleClearContext} disabled={managingConversation}>
              {t("ai.clearContext")}
            </Button>
            <Button size="small" variant={showConfig ? "contained" : "text"} startIcon={<SettingsOutlined />} onClick={() => setShowConfig((prev) => !prev)}>
              {t("ai.sessionConfig")}
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }}>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 220 } }}>
              <Select value={selectedKnowledgeId} displayEmpty onChange={handleKnowledgeChange}>
                <MenuItem value="">{t("ai.noKnowledgeSelected")}</MenuItem>
                {knowledges.map((knowledge) => (
                  <MenuItem key={knowledge.id} value={knowledge.id}>
                    {knowledge.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {roles.length > 0 && (
              <>
                <Button
                  size="small"
                  onClick={(event) => setRoleMenuAnchor(event.currentTarget)}
                  startIcon={
                    selectedRoleId ? (
                      <RoleAvatar role={toRoleAvatarModel(selectedRole)} sx={{ width: 18, height: 18 }} />
                    ) : undefined
                  }
                >
                  {selectedRole?.name || t("ai.defaultRole")}
                </Button>
                <Menu anchorEl={roleMenuAnchor} open={Boolean(roleMenuAnchor)} onClose={() => setRoleMenuAnchor(null)}>
                  <MenuItem
                    onClick={() => {
                      setSelectedRoleId(undefined);
                      setRoleMenuAnchor(null);
                    }}
                    selected={!selectedRoleId}
                  >
                    {t("ai.defaultRole")}
                  </MenuItem>
                  {roles.map((role) => (
                    <MenuItem
                      key={role.id}
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setRoleMenuAnchor(null);
                      }}
                      selected={role.id === selectedRoleId}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <RoleAvatar role={toRoleAvatarModel(role)} sx={{ width: 20, height: 20 }} />
                        {role.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <Tooltip title={t("ai.useKnowledgeContext")}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: { lg: "auto" } }}>
                <Search sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption">{t("ai.context")}</Typography>
                <Switch size="small" checked={useContext} onChange={(_event, checked) => setUseContext(checked)} />
              </Stack>
            </Tooltip>

            <Tooltip title={t("ai.useWebSearch")}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Globe sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption">{t("ai.webSearch")}</Typography>
                <Switch size="small" checked={useSearch} onChange={(_event, checked) => setUseSearch(checked)} />
              </Stack>
            </Tooltip>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {t("ai.knowledgeHint")}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" color={composerMode === "knowledge" ? "primary" : "default"} variant={composerMode === "knowledge" ? "filled" : "outlined"} label={t("ai.ragModeKnowledge")} onClick={() => setComposerMode("knowledge")} />
            <Chip size="small" color={composerMode === "hybrid" ? "primary" : "default"} variant={composerMode === "hybrid" ? "filled" : "outlined"} label={t("ai.ragModeHybrid")} onClick={() => setComposerMode("hybrid")} />
            <Chip size="small" color={composerMode === "web" ? "primary" : "default"} variant={composerMode === "web" ? "filled" : "outlined"} label={t("ai.ragModeWeb")} onClick={() => setComposerMode("web")} />
            <Chip size="small" color={composerMode === "plain" ? "primary" : "default"} variant={composerMode === "plain" ? "filled" : "outlined"} label={t("ai.ragModePlain")} onClick={() => setComposerMode("plain")} />
          </Stack>

          <Collapse in={showConfig}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={2}>
                <TextField size="small" label={t("ai.conversationTitle")} value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
                <FormControl size="small">
                  <Select value={draftModelId} displayEmpty onChange={handleModelChange}>
                    <MenuItem value="">
                      {defaultModel ? t("ai.followDefaultModel", { name: defaultModel.name }) : t("ai.useServerDefaultModel")}
                    </MenuItem>
                    {models.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name} ({model.platform})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary">
                  {modelsLoading
                    ? t("ai.loadingModels")
                    : currentModel
                      ? t("ai.currentModelSummary", { platform: currentModel.platform, maxTokens: currentModel.max_tokens, maxContexts: currentModel.max_contexts })
                      : t("ai.modelIdHint")}
                </Typography>
                <TextField size="small" label={t("ai.systemPrompt")} value={draftSystemMessage} onChange={(event) => setDraftSystemMessage(event.target.value)} multiline minRows={3} />
                <FormControl>
                  <FormLabel>{t("ai.temperature", { value: draftTemperature.toFixed(2) })}</FormLabel>
                  <Slider value={draftTemperature} min={0} max={2} step={0.1} onChange={(_event, value) => setDraftTemperature(value as number)} />
                </FormControl>
                <FormControl>
                  <FormLabel>{t("ai.maxContexts", { value: draftMaxContexts })}</FormLabel>
                  <Slider value={draftMaxContexts} min={1} max={20} step={1} onChange={(_event, value) => setDraftMaxContexts(value as number)} />
                </FormControl>
                <TextField size="small" type="number" label={t("ai.maxTokensConfig")} value={draftMaxTokens} onChange={(event) => setDraftMaxTokens(Number(event.target.value) || 0)} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{t("ai.pinConversation")}</Typography>
                  <Switch checked={draftPinned} onChange={(_event, checked) => setDraftPinned(checked)} />
                </Stack>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" startIcon={<ArrowSync />} onClick={resetConfig}>
                    {t("ai.resetConfig")}
                  </Button>
                  <Button size="small" variant="contained" onClick={handleSaveConfig} disabled={!currentID || savingConfig}>
                    {savingConfig ? t("ai.savingConfig") : t("ai.saveConfig")}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Collapse>
        </Paper>

        <Box sx={{ flex: 1, overflow: "auto", bgcolor: theme.palette.action.hover, py: 2 }}>
          {error && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {messages.length === 0 && !loading && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                color: "text.secondary",
                px: 3,
                textAlign: "center",
              }}
            >
              <Bot sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body1">{t("ai.startChat")}</Typography>
              <Typography variant="body2">
                {selectedKnowledge ? t("ai.chattingWithKnowledge", { name: selectedKnowledge.name }) : t("ai.chatIntro")}
              </Typography>
            </Box>
          )}

          {conversationTurns.map((turn) => (
            <React.Fragment key={turn.key}>
              {turn.send && <MessageCard msg={turn.send} onOpenMenu={handleOpenMessageMenu} />}
              {turn.responses.length > 0 && (
                <AssistantVersionGroup
                  turnKey={turn.key}
                  send={turn.send}
                  responses={turn.responses}
                  selectedVersion={selectedResponseVersions[turn.key] ?? turn.responses.length - 1}
                  onSelectVersion={handleSelectResponseVersion}
                  onOpenMenu={handleOpenMessageMenu}
                />
              )}
            </React.Fragment>
          ))}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Menu anchorEl={messageMenuAnchor} open={Boolean(messageMenuAnchor)} onClose={handleCloseMessageMenu}>
          <MenuItem onClick={handleCopyMessage}>{t("ai.copyMessage")}</MenuItem>
          <MenuItem onClick={handleQuoteMessage}>{t("ai.quoteMessage")}</MenuItem>
          {messageMenuTarget?.type === "send" && (
            <MenuItem onClick={handleStartEditMessage}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Edit sx={{ fontSize: 18 }} />
                {t("ai.editMessage")}
              </Box>
            </MenuItem>
          )}
          {messageMenuTarget?.type === "send" && <MenuItem onClick={handleResendMessage}>{t("ai.resendMessage")}</MenuItem>}
          <MenuItem onClick={handleDeleteMessage}>{t("ai.deleteMessage")}</MenuItem>
        </Menu>

        <Paper elevation={0} sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, borderRadius: 0 }}>
          <Stack spacing={1.25}>
            {editingMessageId && (
              <Alert
                severity="info"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setEditingMessageId(null);
                      setInput("");
                    }}
                  >
                    {t("ai.cancelEditMessage")}
                  </Button>
                }
              >
                {t("ai.editingMessageHint")}
              </Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Document />}
                onClick={handleAttachSelectedFiles}
                disabled={selectableFiles.length === 0 || Boolean(editingMessageId)}
              >
                {t("ai.attachSelectedFiles", { count: selectableFiles.length })}
              </Button>
              <Typography variant="caption" color="text.secondary">
                {selectableFiles.length > 0 ? t("ai.attachSelectedFilesHint") : t("ai.noSelectedFileAttachments")}
              </Typography>
            </Stack>

            <ChatAttachmentList attachments={asArray(draftAttachments).map((file) => getFileLinkedUri(file))} onRemove={handleRemoveAttachment} />

            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={6}
                placeholder={t("ai.inputPlaceholder")}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                size="small"
              />
              {isStreaming() ? (
                <IconButton onClick={abortCurrentStream} color="error">
                  <Dismiss />
                </IconButton>
              ) : (
                <IconButton onClick={handleSend} color="primary" disabled={!input.trim() && draftAttachments.length === 0}>
                  <Send />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatTab;
