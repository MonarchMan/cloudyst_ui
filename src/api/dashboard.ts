import { EntityType, PaginationResults, PolicyType } from "./explorer.ts";
import { Capacity, UserInfo } from "./user.ts";
import { TaskStatus, TaskSummary, TaskType } from "./workflow.ts";

export interface MetricsSummary {
  dates: string[];
  files: number[];
  users: number[];
  shares: number[];
  file_total: number;
  user_total: number;
  share_total: number;
  entities_total: number;
  generated_at: string;
}

export interface Version {
  version: string;
  pro: boolean;
  commit: string;
}

export interface HomepageSummary {
  metrics_summary?: MetricsSummary;
  site_urls: string[];
  version: Version;
}

export interface ManualRefreshLicenseService {
  license: string;
}

export interface GetSettingService {
  keys: string[];
}

export interface SetSettingService {
  settings: {
    [key: string]: string;
  };
}

export interface GroupModel extends CommonMixin {
  name: string;
  max_storage?: number;
  speed_limit?: number;
  permissions?: string;
  settings?: GroupSetting;
  storage_policy_id: number;
  storage_policy_info?: StoragePolicyInfo;
}

export interface StoragePolicyInfo {
  id: number;
  name: string;
  type: string;
  is_private: boolean;
}

export interface Group extends GroupModel {
  total_users?: number;
}

export interface GroupSetting {
  compress_size?: number;
  decompress_size?: number;
  remote_download_options?: Record<string, any>;
  source_batch?: number;
  aria2_batch?: number;
  max_walked_files?: number;
  trash_retention?: number;
  redirected_source?: boolean;
}

export interface AdminListGroupResponse {
  groups: Group[];
  pagination: PaginationResults;
}

export interface QQConnectConfig {
  app_id?: string;
  app_secret?: string;
  direct_sign_in?: boolean;
}

export interface LogtoConfig {
  endpoint?: string;
  app_id?: string;
  app_secret?: string;
  direct_sign_in?: boolean;
  display_name?: string;
  direct_sso?: string;
}

export interface FetchWOPIDiscoveryService {
  endpoint: string;
}

export interface ThumbGeneratorTestService {
  name: string;
  executable: string;
}

export interface TestSMTPService {
  to: string;
  settings: {
    [key: string]: string;
  };
}

export enum QueueType {
  IO_INTENSE = "io_intense",
  MEDIA_META = "media_meta",
  RECYCLE = "recycle",
  THUMB = "thumb",
  REMOTE_DOWNLOAD = "remote_download",
}

export interface QueueMetric {
  name: QueueType;
  busy_workers: number;
  success_tasks: number;
  failed_tasks: number;
  submitted_tasks: number;
  suspending_tasks: number;
}

export interface QueueMetricsResponse {
  metrics: QueueMetric[];
}

export interface CommonMixin {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface StoragePolicy extends CommonMixin {
  name: string;
  type: PolicyType;
  server?: string;
  bucket_name?: string;
  is_private?: boolean;
  access_key?: string;
  secret_key?: string;
  max_size?: number;
  auto_rename?: boolean;
  dir_name_rule?: string;
  file_name_rule?: string;
  settings?: PolicySetting;
  node_id?: number;
  node?: Node;
  entities_count?: number;
  entities_size?: number;
  hash_id?: string;
}

export enum NodeType {
  master = 1,
  slave = 2,
}

export interface ListNodeResponse {
  nodes: Node[];
  pagination: PaginationResults;
}

export interface Node extends CommonMixin {
  name?: string;
  status?: NodeStatus;
  type?: NodeType;
  server?: string;
  slave_key?: string;
  capabilities?: string;
  weight?: number;
  settings?: NodeSetting;
  storage_policy?: StoragePolicy[];
}

export enum DownloaderProvider {
  qbittorrent = "qbittorrent",
  aria2 = "aria2",
}

export interface QBittorrentSetting {
  server?: string;
  user?: string;
  password?: string;
  options?: Record<string, string>;
  temp_path?: string;
}

export interface Aria2Setting {
  server?: string;
  token?: string;
  options?: Record<string, string>;
  temp_path?: string;
}

export interface NodeSetting {
  provider?: DownloaderProvider;
  qbittorrent?: QBittorrentSetting;
  aria2?: Aria2Setting;
  interval?: number;
  wait_for_seeding?: boolean;
}

export enum NodeStatus {
  active = "active",
  suspended = "suspended",
}

export interface PolicySetting {
  token?: string;
  file_type?: string[];
  is_file_type_deny_list?: boolean;
  file_regexp?: string;
  is_name_regexp_deny_list?: boolean;
  od_redirect?: string;
  custom_proxy?: boolean;
  proxy_server?: string;
  internal_proxy?: boolean;
  od_driver?: string;
  region?: string;
  server_side_endpoint?: string;
  chunk_size?: number;
  tps_limit?: number;
  tps_limit_burst?: number;
  s3_path_style?: boolean;
  thumb_exts?: string[];
  thumb_support_all_exts?: boolean;
  thumb_max_size?: number;
  relay?: boolean;
  pre_allocate?: boolean;
  media_meta_exts?: string[];
  media_meta_generator_proxy?: boolean;
  thumb_generator_proxy?: boolean;
  native_media_processing?: boolean;
  s3_delete_batch_size?: number;
  stream_saver?: boolean;
  use_cname?: boolean;
  source_auth?: boolean;
  qiniu_upload_cdn?: boolean;
  chunk_concurrency?: number;
}

export interface UserModel extends CommonMixin {
  email: string;
  nick: string;
  password?: string;
  settings?: UserSetting;
  status?: UserStatus;
  storage?: number;
  avatar?: string;
  credit?: number;
  group_expires?: string;
  notify_date?: string;
  group_users?: number;
  previous_group?: number;
  unmanaged_email?: boolean;
  group?: Group;
  openid?: OpenID[];
  passkey?: Passkey[];
}

export interface User {
  user: UserModel;

  hash_id?: string;
  two_fa_enabled?: boolean;
  capacity?: Capacity;
}

export interface OpenID extends CommonMixin {
  provider?: number;
}

export interface Passkey extends CommonMixin {
  name?: string;
}

export enum UserStatus {
  active = "active",
  inactive = "inactive",
  manual_banned = "manual_banned",
  sys_banned = "sys_banned",
}

export interface UserSetting {
  profile_off?: boolean;
  preferred_policy?: number;
  preferred_theme?: string;
  version_retention?: boolean;
  version_retention_ext?: string[];
  version_retention_max?: number;
  pined?: PinedFile[];
  language?: string;
}

export interface PinedFile {
  uri: string;
  name?: string;
}

export interface ListStoragePolicyResponse {
  policies: StoragePolicy[];
  pagination: PaginationResults;
}

export interface AdminListService {
  page: number;
  page_size: number;
  order_by: string;
  order_direction: string;
  conditions?: Record<string, string>;
  searches?: Record<string, string>;
}

export enum OrderDirection {
  ASC = 0,
  DESC = 1,
}

export interface UpsertStoragePolicyService {
  policy: StoragePolicy;
}

export interface CreateStoragePolicyCorsService {
  policy: StoragePolicy;
}

export interface GetUrlResponse {
  url: string;
}

export interface OauthCredentialStatus {
  last_refresh_time: string;
  valid: boolean;
}

export interface GetOauthRedirectService {
  id: number;
  secret: string;
  app_id: string;
}

export interface FinishOauthCallbackService {
  code: string;
  state: string;
}

export interface UpsertGroupService {
  group: GroupModel;
}

export interface TestNodeService {
  node: Node;
}

export interface TestNodeDownloaderService extends TestNodeService {}

export interface UpsertNodeService extends TestNodeService {}

export interface ListUserResponse {
  users: User[];
  pagination: PaginationResults;
}

export interface UpsertUserService {
  user: User;
  password?: string;
  two_fa?: string;
}

export interface BatchIDService {
  ids: number[];
  force?: boolean;
}

/*
FilePermissions struct {
		Groups map[int]*boolset.BooleanSet `json:"groups,omitempty"`
		Users  map[int]*boolset.BooleanSet `json:"users,omitempty"`
	}

*/

export interface FileModel extends CommonMixin {
  type?: number;
  name?: string;
  owner_id?: number;
  owner_info?: UserInfo;
  size?: number;
  primary_entity?: number;
  file_parent_id?: number;
  is_symbolic?: boolean;
  storage_policy_files?: number;
  storage_policies?: StoragePolicy;
  metadata?: Metadata[];
  entities?: EntityModel[];
  direct_links?: DirectLink[];
  shares?: ShareModel[];
}

export interface File {
  file: FileModel;
  user_hash_id?: string;
  file_hash_id?: string;
  direct_link_map?: Record<number, string>;
}

export interface DirectLink extends CommonMixin {
  name?: string;
  downloads?: number;
  speed?: number;
}

export interface EntityModel extends CommonMixin {
  type?: EntityType;
  source?: string;
  size?: number;
  reference_count?: number;
  storage_policy_entities?: number;
  created_by: number;
  upload_session_id?: string;
  storage_policy?: StoragePolicy;
  file?: FileModel[];
}

export interface Entity {
  entity: EntityModel;
  user_hash_id?: string;
  user_hash_id_map?: Record<number, string>;
}

export interface Metadata extends CommonMixin {
  name?: string;
  value?: string;
  is_public?: boolean;
}

export interface ListFileResponse {
  files: File[];
  pagination: PaginationResults;
}

export interface UpsertFileService {
  file: File;
}

export interface ListEntityResponse {
  entities: Entity[];
  pagination: PaginationResults;
}

export interface LogEntry {
  category: number;
  failed?: boolean;
  error?: string;
  user_agent?: string;
  is_system?: boolean;
  reason?: string;
  email_to?: string;
  email_title?: string;
  original_name?: string;
  new_name?: string;
  from?: string;
  to?: string;
  entity_create_time?: string;
  storage_policy_id?: string;
  storage_policy_name?: string;
  account_id?: number;
  account?: string;
  account_uri?: string;
  payment_id?: number;
  points_change?: number;
  sku?: string;
  storage_size?: number;
  expire?: string;
  group_id?: number;
  group_id_from?: number;
  direct_link_id?: string;
  openid_provider?: number;
  sub?: string;
  name?: string;
  passkey_id?: number;
  exts?: Record<string, string>;
}

export interface AuditLog extends CommonMixin {
  type?: number;
  correlation_id?: string;
  ip?: string;
  content?: LogEntry;
  edges: {
    user?: User;
    file?: File;
    entity?: EntityModel;
    share?: Share;
  };

  user_hash_id?: string;
}

export interface ListAuditLogResponse {
  logs: AuditLog[];
  pagination: PaginationResults;
}

export interface TaskPublicState {
  error?: string;
  error_history?: string[];
  executed_duration?: number;
  retry_count?: number;
  resume_time?: number;
  slave_task_props?: SlaveTaskProps;
}

export interface SlaveTaskProps {
  node_id?: number;
  master_site_url?: string;
  master_site_id?: string;
  master_site_version?: string;
}

export interface TaskModel extends CommonMixin {
  type?: string;
  status?: TaskStatus;
  public_state?: TaskPublicState;
  private_state?: string;
  correlation_id?: string;
  user_tasks?: number;
  user_id?: number;
}

export interface Task {
  task: TaskModel;
  user_hash_id?: string;
  task_hash_id?: string;
  summary?: TaskSummary;
  node?: Node;
}

export interface ListTaskResponse {
  tasks: Task[];
  pagination: PaginationResults;
}

export interface ShareModel extends CommonMixin {
  password?: string;
  views?: number;
  downloads?: number;
  expires?: string;
  remain_downloads?: number;
  owner_id?: number;
  owner_info?: UserInfo;
  file?: FileModel;
}

export interface Share {
  share: ShareModel;
  user_hash_id?: string;
  share_link?: string;
}

export interface ListShareResponse {
  shares: Share[];
  pagination: PaginationResults;
}

export interface CleanupTaskService {
  not_after: string;
  types?: TaskType[];
  status?: TaskStatus[];
}

export enum Status {
  active = "active",
  inactive = "inactive",
}

export interface AiApiKey extends CommonMixin {
  name?: string;
  api_key?: string;
  platform?: string;
  url?: string;
  status?: Status;
  ai_model?: AiModel;
}

export interface AiModel extends CommonMixin {
  name?: string;
  model?: string;
  type?: string;
  platform?: string;
  sort?: number;
  status?: Status;
  temperature?: number;
  max_tokens?: number;
  max_contexts?: number;
  key_id?: number;
  api_key?: AiApiKey;
}

export interface AiTool extends CommonMixin {
  name?: string;
  description?: string;
  type?: string;
  parameters?: string;
  status?: Status;
}

export interface AiWebPage extends CommonMixin {
  name?: string;
  icon?: string;
  url?: string;
  snippet?: string;
  summary?: string;
  message_id?: number;
  ai_chat_message?: AiChatMessageModel;
}

export interface AiChatMessageModel extends CommonMixin {
  conversation_id?: number;
  user_id?: number;
  role_id?: number;
  model_id?: number;
  model?: string;
  type?: string;
  reply_id?: number;
  content?: string;
  reason_content?: string;
  use_context?: boolean;
  segment_ids?: number[];
  attachment_urls?: string[];
  ai_web_pages?: AiWebPage[];
}

export interface AiChatMessage {
  message: AiChatMessageModel;
  owner_info?: UserInfo;
}

export interface AiChatConversationModel extends CommonMixin {
  title?: string;
  pinned?: boolean;
  user_id?: number;
  role_id?: number;
  system_message?: string;
  model_id?: number;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  max_contexts?: number;
}

export interface AiChatConversation {
  conversation: AiChatConversationModel;
  owner_info?: UserInfo;
}

export interface AiChatRoleModel extends CommonMixin {
  name?: string;
  avatar?: string;
  description?: string;
  sort?: number;
  user_id?: number;
  public_status?: boolean;
  category?: string;
  system_message?: string;
  knowledge_ids?: number[];
  tool_ids?: number[];
  mcp_client_names?: string[];
  status?: Status;
}

export interface AiChatRole {
  role: AiChatRoleModel;
  owner_info?: UserInfo;
}

export interface AiImageModel extends CommonMixin {
  user_id?: number;
  platform?: string;
  model_id?: number;
  model?: string;
  prompt?: string;
  width?: number;
  height?: number;
  options?: string;
  pic_url?: string;
  task_id?: number;
  buttons?: string[];
  status?: ImageStatus;
}

export interface AiImage {
  image: AiImageModel;
  owner_info?: UserInfo;
}

export enum ImageStatus {
  pending = "pending",
  generating = "generating",
  succeeded = "success",
  failed = "failed",
}

export interface AiKnowledgeModel extends CommonMixin {
  name?: string;
  description?: string;
  embedding_model_id?: number;
  embedding_model?: string;
  top_k?: number;
  similarity_threshold?: number;
  status?: Status;
  user_id?: number;
  is_public?: boolean;
  is_master?: boolean;
  ai_knowledge_document?: AiKnowledgeDocument[];
}
export interface AiKnowledge {
  knowledge: AiKnowledgeModel;
  owner_info?: UserInfo;
}

export enum DocumentProgress {
  Pending = "pending",
  Processing = "processing",
  Success = "success",
  Failed = "failed",
}
export interface AiKnowledgeDocument extends CommonMixin {
  name?: string;
  knowledge_id?: number;
  url?: string;
  version?: string;
  content_length?: number;
  tokens?: number;
  segment_max_tokens?: number;
  retrival_count?: number;
  progress?: DocumentProgress;
  status?: Status;
  ai_knowledge?: AiKnowledgeModel;
  ai_knowledge_segment?: AiKnowledgeSegment[];
}

export interface AiKnowledgeSegment extends CommonMixin {
  document_id?: number;
  content_length?: number;
  tokens?: number;
  vector_id?: string;
  retrival_count?: number;
  status?: Status;
  ai_knowledge_document?: AiKnowledgeDocument;
}

export interface ListAiApiKeyResponse {
  api_keys: AiApiKey[];
  pagination: PaginationResults;
}

export interface ListAiModelResponse {
  models: AiModel[];
  pagination: PaginationResults;
}

export interface ListAiToolResponse {
  tools: AiTool[];
  pagination: PaginationResults;
}

export interface ListAiWebPageResponse {
  web_pages: AiWebPage[];
  pagination: PaginationResults;
}

export interface ListAiChatMessageResponse {
  messages: AiChatMessage[];
  pagination: PaginationResults;
}

export interface ListAiChatConversationResponse {
  conversations: AiChatConversation[];
  pagination: PaginationResults;
}

export interface ListAiChatRoleResponse {
  roles: AiChatRole[];
  pagination: PaginationResults;
}

export interface ListAiImageResponse {
  images: AiImage[];
  pagination: PaginationResults;
}

export interface ListAiKnowledgeResponse {
  knowledges: AiKnowledge[];
  pagination: PaginationResults;
}

export interface ListAiKnowledgeDocumentResponse {
  documents: AiKnowledgeDocument[];
  pagination: PaginationResults;
}

export interface ListAiKnowledgeSegmentResponse {
  segments: AiKnowledgeSegment[];
  pagination: PaginationResults;
}

export interface OAuthClientProps {
  icon?: string;
  refresh_token_ttl?: number;
}

export interface OAuthClient extends CommonMixin {
  guid?: string;
  secret?: string;
  name?: string;
  homepage_url?: string; // Not used
  redirect_uris?: string[];
  scopes?: string[];
  props?: OAuthClientProps;
  is_enabled?: boolean;
}

export interface GetOAuthClientResponse extends OAuthClient {
  is_system?: boolean;
  total_grants?: number;
}

export interface ListOAuthClientResponse {
  clients: GetOAuthClientResponse[];
  pagination: PaginationResults;
}

export interface UpsertOAuthClientService {
  client: OAuthClient;
}