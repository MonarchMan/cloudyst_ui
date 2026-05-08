import { PaginationArgs, PaginationResults } from "./common.ts";
import { OrderDirection, Status } from "./dashboard.ts";

// Conversation APIs
export interface CreateChatConversationRequest {
  role_id?: string;
  knowledge_id?: string;
  model_id?: string;
}

export interface GetChatConversationResponse {
  id: string;
  title: string;
  pinned: boolean;
  system_message: string;
  model: string;
  temperature: number;
  max_tokens: number;
  max_contexts: number;
  created_at: string;

  role_avatar?: string;
  role_name?: string;

  message_count: number;
}

export interface UpdateChatConversationRequest {
  id: string;
  title?: string;
  pinned?: boolean;
  system_message?: string;
  model_id?: string;
  temperature?: number;
  max_tokens?: number;
  max_contexts?: number;
}

export interface ListConversactionRequest {
  pagination?: PaginationArgs;
  title?: string;
  start?: string;
  end?: string;
}

export interface ListConversationResponse {
  conversations: GetChatConversationResponse[];
  pagination: PaginationResults;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  use_context?: boolean;
  use_search?: boolean;
  attachment_urls?: string[];
  model_id?: string;
}

export interface SendMessageResponse {
  send?: MessageRecord;
  receive?: MessageRecord;
}

export interface MessageRecord {
  id: string;
  type: string;
  content: string;
  reason_content?: string;
  conversation_id: string;
  segments?: KnowledgeSegment[];
  web_pages?: WebPage[];
  created_at: string;
  attachment_urls?: string[];
  parent_send_id?: string;
  status?: MessageStatus;
  error_message?: string;
  use_context?: boolean;
  use_search?: boolean;
  model_id?: string;
}

export enum MessageStatus {
  Sending = "sending",
  Streaming = "streaming",
  Completed = "completed",
  Failed = "failed",
  Canceled = "canceled",
}

export interface KnowledgeSegment {
  id: string;
  content: string;
  document_id: string;
  document_name?: string;
}

export interface WebPage {
  name: string;
  icon?: string;
  title: string;
  url: string;
  snippet?: string;
  summary?: string;
}

export interface DeleteMessageRequest {
  id: string;
  cascade?: boolean;
}

export interface RetryMessageRequest {
  id: string;
  use_context?: boolean;
  use_search?: boolean;
  model_id?: string;
}

export interface PatchMessageRequest {
  id: string;
  content: string;
  use_context?: boolean;
  use_search?: boolean;
  model_id?: string;
}

export interface ListAllConversationsResponse {
  conversations: GetChatConversationResponse[];
}

export interface ListConversationMessagesRequest {
  conversation_id: string;
  pagination?: PaginationArgs;
}

export interface ListConversationMessagesResponse {
  messages: MessageRecord[];
  pagination: PaginationResults;
}

// Image APIs
export interface GetImageResponse {
  id: string;
  user_id: string;
  platform: string;
  model: string;
  prompt: string;
  width: number;
  height: number;
  pic_url: string;
  error_message?: string;
  created_at: string;
  finished_at?: string;
}

export interface ListImagesRequest {
  pagination?: PaginationArgs;
  user_id?: string;
  platform?: string;
  prompt?: string;
  status?: string;
  is_public?: boolean;
  start?: string;
  end?: string;
}

export interface ListImagesResponse {
  images: GetImageResponse[];
  pagination: PaginationResults;
}

// Knowledge APIs
export interface UpsertKnowledgeRequest {
  id?: string;
  name?: string;
  description?: string;
  status?: Status;
  is_public?: boolean;
}

export interface GetKnowledgeResponse {
  id: string;
  name: string;
  description: string;
  embedding_model: string;
  top_k: number;
  status: Status;
  is_master: boolean;
  is_public: boolean;
}

export interface ListKnowledgeRequest {
  pagination?: PaginationArgs;
  name?: string;
  status?: Status;
  is_public?: boolean;
}

export interface ListKnowledgeResponse {
  knowledges: GetKnowledgeResponse[];
  pagination: PaginationResults;
}

export interface UpsertDocumentRequest {
  id?: string;
  knowledge_id: string;
  name: string;
  url: string;
  version?: string;
  segment_max_tokens?: number;
  status?: Status;
}

export interface UpsertDocumentResponse {
  document: GetDocumentResponse;
  task_id?: string;
}

export interface BatchCreateDocumentRequest {
  documents: UpsertDocumentRequest[];
}

export interface BatchUpsertDocumentResponse {
  documents: GetDocumentResponse[];
  task_id?: string;
  total: number;
}

export interface GetDocumentResponse {
  id: string;
  knowledge_id: string;
  name: string;
  url: string;
  version: string;
  tokens?: number;
  segment_max_tokens: number;
  progress: DocumentProgress;
  status: Status;
  created_at: string;
  updated_at: string;
}

export enum DocumentProgress {
  Pending = "pending",
  Processing = "processing",
  Success = "success",
  Failed = "failed",
} 
export interface GetDocumentProgressResponse {
  id: string;
  name: string;
  progress: DocumentProgress;
}

export interface ListDocumentsRequest {
  pagination?: PaginationArgs;
  knowledge_id?: string;
  name?: string;
  progress?: DocumentProgress;
  path_keyword?: string;
  status?: Status;
}

export interface ListDocumentsResponse {
  documents: GetDocumentResponse[];
  pagination: PaginationResults;
}

// Role APIs
export interface GetRoleResponse {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  sort?: number;
  is_public?: boolean;
  category?: string;
  system_message?: string;
  knowledge_ids?: string[];
  tool_ids?: string[];
  mcp_client_names?: string[];
  created_at: string;
}

export interface UpsertRoleRequest {
  id?: string;
  name: string;
  avatar?: string;
  description?: string;
  sort?: number;
  is_public?: boolean;
  category?: string;
  system_message?: string;
  knowledge_ids?: string[];
  tool_ids?: string[];
  mcp_client_names?: string[];
}

export interface ListRolesRequest {
  pagination?: PaginationArgs;
  name?: string;
  category?: string;
  is_public?: boolean;
}

export interface ListRolesResponse {
  roles: GetRoleResponse[];
  pagination: PaginationResults;
}

export interface GetMyRolesResponse {
  roles: GetRoleResponse[];
}

export interface GetKnowledgeStatsResponse {
  document_count: number;
  ready: number;
  processing: number;
  success: number;
  failed: number;
  total_tokens: number;
}

export interface BatchReindexDocumentResponse {
  progresses: GetDocumentProgressResponse[];
  total: number;
  task_id?: string;
}

export interface ReindexDocumentResponse {
  progress?: GetDocumentProgressResponse;
  task_id?: string;
}

export interface GetModelResponse {
  id: string;
  name: string;
  platform: string;
  temperature: number;
  max_tokens: number;
  max_contexts: number;
}

export interface ListModelRequest {
  pagination?: PaginationArgs;
  name?: string;
  platform?: string;
}

export interface ListModelResponse {
  models: GetModelResponse[];
  pagination: PaginationResults;
}

export interface CancelTaskRequest {
  id: string[];
  terminate?: boolean;
  type: string;
}

export interface ResumeTaskRequest {
  id: string[];
  type: string;
}