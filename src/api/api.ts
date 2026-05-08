import { AxiosProgressEvent, CancelToken } from "axios";
import i18n from "../i18n.ts";
import {
  AdminListGroupResponse,
  AdminListService,
  ListShareResponse as AdminListShareResponse,
  StoragePolicy as AdminStoragePolicy,
  BatchIDService,
  CleanupTaskService,
  CreateStoragePolicyCorsService,
  Entity,
  FetchWOPIDiscoveryService,
  File as FileEnt,
  FinishOauthCallbackService,
  GetOauthRedirectService,
  GetSettingService,
  GetUrlResponse,
  Group,
  HomepageSummary,
  ListEntityResponse,
  ListFileResponse,
  ListNodeResponse,
  ListStoragePolicyResponse,
  ListTaskResponse,
  ListUserResponse,
  Node,
  OauthCredentialStatus,
  QueueMetric,
  QueueMetricsResponse,
  SetSettingService,
  Share as ShareEnt,
  Task,
  TestNodeDownloaderService,
  TestNodeService,
  TestSMTPService,
  ThumbGeneratorTestService,
  UpsertFileService,
  UpsertGroupService,
  UpsertNodeService,
  UpsertStoragePolicyService,
  UpsertUserService,
  User as UserEnt,
  AiApiKey,
  ListAiApiKeyResponse,
  ListAiImageResponse,
  ListAiKnowledgeDocumentResponse,
  AiKnowledgeDocument,
  Status,
  AiModel,
  ListAiModelResponse,
  ListAiChatRoleResponse,
  AiChatRole,
  AiChatConversation,
  ListAiChatConversationResponse,
  AiChatMessage,
  ListAiChatMessageResponse,
  AiKnowledgeModel,
  ListAiKnowledgeResponse,
  AiKnowledge,
  AiKnowledgeSegment,
  ListAiKnowledgeSegmentResponse,
  AiTool,
  ListAiToolResponse,
  AiImage,
  AiChatRoleModel,
} from "./dashboard.ts";
import {
  ArchiveListFilesResponse,
  ArchiveListFilesService,
  CreateFileService,
  CreateViewerSessionService,
  DeleteFileService,
  DeleteUploadSessionService,
  DirectLink,
  FileResponse,
  FileThumbResponse,
  FileUpdateService,
  FileURLResponse,
  FileURLService,
  GetFileInfoService,
  ListFileService,
  ListResponse,
  MoveFileService,
  MultipleUriService,
  PatchMetadataService,
  PatchViewSyncService,
  PinFileService,
  RenameFileService,
  Share,
  ShareCreateService,
  SourceResponse,
  TestThumbGeneratorResponse,
  UnlockFileService,
  UploadCredential,
  UploadSessionRequest,
  VersionControlService,
  ViewerGroup,
  ViewerSessionResponse,
} from "./explorer.ts";
import { AppError, Code, CrHeaders, defaultOpts, isRequestAbortedError, send, ThunkResponse } from "./request.ts";
import { AdminSettingResponse, CreateDavAccountService, DavAccount, ListDavAccountsResponse, ListDavAccountsService } from "./setting.ts";
import { ListShareResponse, ListShareService } from "./share.ts";
import { CaptchaResponse, SiteBasicInfoResponse, SiteConfig } from "./site.ts";
import {
  Capacity,
  FinishPasskeyLoginService,
  FinishPasskeyRegistrationService,
  Init2FAResponse,
  LoginResponse,
  Passkey,
  PasskeyCredentialOption,
  PasswordLoginRequest,
  PatchUserSetting,
  PrepareLoginResponse,
  PreparePasskeyLoginResponse,
  RefreshTokenRequest,
  ResetPasswordService,
  SendResetEmailService,
  SignUpService,
  Token,
  TwoFALoginRequest,
  User,
  UserSettings,
} from "./user.ts";
import {
  ArchiveWorkflowService,
  DownloadWorkflowService,
  ImportWorkflowService,
  ListTaskService,
  SetDownloadFilesService,
  TaskListResponse,
  TaskProgresses,
  TaskResponse,
} from "./workflow.ts";
import { UpsertShareResponse } from "../redux/thunks/share.ts";
import { CreateChatConversationRequest,
  GetChatConversationResponse,
  GetDocumentResponse,
  GetImageResponse,
  GetKnowledgeResponse,
  GetRoleResponse,
  ListAllConversationsResponse,
  ListConversactionRequest,
  ListConversationResponse,
  ListConversationMessagesRequest,
  ListConversationMessagesResponse,
  ListDocumentsRequest, ListDocumentsResponse,
  ListImagesRequest,
  ListImagesResponse,
  ListKnowledgeRequest,
  ListKnowledgeResponse,
  ListRolesRequest,
  ListRolesResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateChatConversationRequest,
  UpsertDocumentRequest,
  UpsertKnowledgeRequest,
  UpsertRoleRequest,
  BatchCreateDocumentRequest,
  GetDocumentProgressResponse,
  GetKnowledgeStatsResponse,
  BatchReindexDocumentResponse,
  ReindexDocumentResponse,
  GetModelResponse,
  ListModelRequest,
  ListModelResponse,
  RetryMessageRequest,
  PatchMessageRequest,
  DeleteMessageRequest,
  UpsertDocumentResponse,
  BatchUpsertDocumentResponse,
  CancelTaskRequest,
  ResumeTaskRequest
} from "./ai.ts";
import { DeleteRequest, ListTaskRequest, ServiceName } from "./common.ts";

export function getSiteBasicInfo(): ThunkResponse<SiteBasicInfoResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/site/basic",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => isRequestAbortedError(e),
        },
      ),
    );
  };
}

export function getSiteConfig(section: string): ThunkResponse<SiteConfig> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/site/config/" + section,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => isRequestAbortedError(e),
          errorSnackbarMsg: (e) => i18n.t("errLoadingSiteConfig", { ns: "common" }) + e.message,
        },
      ),
    );
  };
}

export function sendPrepareLogin(email: string): ThunkResponse<PrepareLoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/session/prepare",
        {
          params: {
            email: email,
          },
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.NodeFound,
        },
      ),
    );
  };
}

export function getCaptcha(): ThunkResponse<CaptchaResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/site/captcha",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
          errorSnackbarMsg: (e) => i18n.t("captchaError", { ns: "common" }) + e.message,
        },
      ),
    );
  };
}

export function sendLogin(req: PasswordLoginRequest): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/session/token",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.Continue,
        },
      ),
    );
  };
}

export function send2FALogin(req: TwoFALoginRequest): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/session/token/2fa",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getUserMe(): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/user/me",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRefreshToken(req: RefreshTokenRequest): ThunkResponse<Token> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/session/token/refresh",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendSignout(req: RefreshTokenRequest): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/session/token",
        {
          params: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getFileList(req: ListFileService, skipSnackbar = true): ThunkResponse<ListResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file",
        {
          params: req,
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: () => skipSnackbar,
        },
      ),
    );
  };
}

export function getFileThumb(path: string, contextHint?: string): ThunkResponse<FileThumbResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/thumb",
        {
          params: { uri: path },
          method: "GET",
          headers: contextHint
            ? {
                [CrHeaders.context_hint]: contextHint,
              }
            : {},
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function getUserInfo(uid: string): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/user/info/" + uid,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function getUserCapacity(): ThunkResponse<Capacity> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/user/capacity",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteFiles(req: DeleteFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file",
        {
          params: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
        },
      ),
    );
  };
}

export function sendUnlockFiles(req: UnlockFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/lock",
        {
          params: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          skipLockConflict: true,
        },
      ),
    );
  };
}

export function sendRenameFile(req: RenameFileService): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/rename",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => isRequestAbortedError(e),
        },
      ),
    );
  };
}

export function sendPinFile(req: PinFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/pin",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUnpinFile(req: PinFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/pin",
        {
          params: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMoveFile(req: MoveFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/move",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
        },
      ),
    );
  };
}

export function sendRestoreFile(req: DeleteFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/restore",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
        },
      ),
    );
  };
}

export function sendMetadataPatch(req: PatchMetadataService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/metadata",
        {
          data: req,
          method: "PATCH",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
        },
      ),
    );
  };
}

export function getSearchUser(keyword: string): ThunkResponse<User[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/user/search?keyword=" + encodeURIComponent(keyword),
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateShare(req: ShareCreateService): ThunkResponse<UpsertShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/share/create",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateShare(req: ShareCreateService, id: string): ThunkResponse<UpsertShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/share/" + id,
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteShare(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/share/" + id,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShareInfo(
  id: string,
  password?: string,
  count_views?: boolean,
  owner_extended?: boolean,
): ThunkResponse<Share> {
  return async (dispatch, _getState) => {
    let uri = "/file/share/info/" + id;
    const query = new URLSearchParams();
    if (password && password != "") {
      query.set("password", password);
    }
    if (count_views) {
      query.set("count_views", "true");
    }
    if (owner_extended) {
      query.set("owner_extended", "true");
    }
    if (query.toString() != "") {
      uri += "?" + query.toString();
    }
    return await dispatch(
      send(
        uri,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendCreateFile(req: CreateFileService): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileEntityUrl(req: FileURLService): ThunkResponse<FileURLResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/url",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
        },
      ),
    );
  };
}

export function getFileInfo(req: GetFileInfoService, skipError = false): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/info",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
          bypassSnackbar: () => skipError,
        },
      ),
    );
  };
}

export function setCurrentVersion(req: VersionControlService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/version/current",
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteVersion(req: VersionControlService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/version",
        {
          method: "DELETE",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateFile(req: FileUpdateService, data: any): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/content",
        {
          data,
          params: req,
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        },
        {
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.StaleVersion,
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateViewerSession(req: CreateViewerSessionService): ThunkResponse<ViewerSessionResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/viewerSession",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateUploadSession(req: UploadSessionRequest): ThunkResponse<UploadCredential> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/upload",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendUploadChunk(
  sessionID: string,
  chunk: Blob,
  index: number,
  cancel?: CancelToken,
  onProgress?: (progressEvent: AxiosProgressEvent) => void,
): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/file/upload/${sessionID}/${index}`,
        {
          data: chunk,
          cancelToken: cancel,
          onUploadProgress: onProgress,
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendDeleteUploadSession(req: DeleteUploadSessionService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/file/upload`,
        {
          params: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendS3LikeCompleteUpload(policyType: string, sessionId: string, sessionKey: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/callback/${policyType}/${sessionId}/${sessionKey}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendOneDriveCompleteUpload(sessionId: string, sessionKey: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/callback/onedrive/${sessionId}/${sessionKey}`,
        {
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendCreateArchive(req: ArchiveWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/archive",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendExtractArchive(req: ArchiveWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/extract",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTasks(req: ListTaskService): ThunkResponse<TaskListResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/list",
        {
          params: req,
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTasksPhaseProgress(id: string): ThunkResponse<TaskProgresses> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/progress/" + id,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateRemoteDownload(req: DownloadWorkflowService): ThunkResponse<TaskListResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/download",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: (req.src?.length ?? 0) <= 1,
        },
      ),
    );
  };
}

export function sendSetDownloadTarget(id: string, req: SetDownloadFilesService): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/download/" + id,
        {
          data: req,
          method: "PATCH",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCancelDownloadTask(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/download/" + id,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShares(req: ListShareService): ThunkResponse<ListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/share/list",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDavAccounts(req: ListDavAccountsService): ThunkResponse<ListDavAccountsResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/devices/dav",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateDavAccounts(req: CreateDavAccountService): ThunkResponse<DavAccount> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/devices/dav",
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateDavAccounts(id: string, req: CreateDavAccountService): ThunkResponse<DavAccount> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/devices/dav/${id}`,
        {
          method: "PATCH",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteDavAccount(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/devices/dav/${id}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileDirectLinks(req: MultipleUriService): ThunkResponse<SourceResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/file/source",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          acceptBatchPartialSuccess: true,
        },
      ),
    );
  };
}

export function sendDeleteDirectLink(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(send(`/file/file/source/${id}`, { method: "DELETE" }, { ...defaultOpts }));
  };
}

export function getUserShares(req: ListShareService, uid: string): ThunkResponse<ListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/share/user/${uid}`,
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserSettings(): ThunkResponse<UserSettings> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/setting`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUploadAvatar(avatar?: Blob, contentType?: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/file/user/avatar`,
        {
          method: "PUT",
          data: avatar,
          headers: contentType
            ? {
                "Content-Type": contentType,
              }
            : undefined,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateUserSetting(settings: PatchUserSetting): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/setting`,
        {
          method: "PATCH",
          data: settings,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function get2FAInitSecret(): ThunkResponse<Init2FAResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/setting/2fa`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendPreparePasskeyRegistration(): ThunkResponse<PasskeyCredentialOption> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/authn`,
        {
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendFinishPasskeyRegistration(req: FinishPasskeyRegistrationService): ThunkResponse<Passkey> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/authn`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeletePasskey(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/authn/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendFinishPasskeyLogin(req: FinishPasskeyLoginService): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/session/authn`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendPreparePasskeyLogin(): ThunkResponse<PreparePasskeyLoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/session/authn`,
        {
          method: "PUT",
          data: {},
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendSinUp(req: SignUpService): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/user/register",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.Continue,
        },
      ),
    );
  };
}

export function sendEmailActivate(id: string, sign: string): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/activate/${id}?sign=${encodeURIComponent(sign)}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendResetEmail(req: SendResetEmailService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/reset`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendReset(uid: string, req: ResetPasswordService): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/user/reset/${uid}`,
        {
          method: "PATCH",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getDashboardSummary(generateCharts?: boolean): ThunkResponse<HomepageSummary> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/site/summary?generate=${!!generateCharts}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSettings(keys: GetSettingService): ThunkResponse<AdminSettingResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/settings`,
        {
          method: "POST",
          data: keys,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendSetSetting(keys: SetSettingService): ThunkResponse<AdminSettingResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/settings`,
        {
          method: "PATCH",
          data: keys,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getGroupList(args: AdminListService): ThunkResponse<AdminListGroupResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/group`,
        {
          method: "POST",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getWopiDiscovery(args: FetchWOPIDiscoveryService): ThunkResponse<ViewerGroup> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/tool/wopi`,
        {
          method: "GET",
          params: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendTestThumbGeneratorExecutable(args: ThumbGeneratorTestService): ThunkResponse<TestThumbGeneratorResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/tool/thumbExecutable`,
        {
          method: "POST",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendTestSMTP(args: TestSMTPService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/tool/mail`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getQueueMetrics(service?: ServiceName): ThunkResponse<QueueMetricsResponse> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.file;
    return await dispatch(
      send(
        `/admin/${service}/queue/metrics`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getStoragePolicyList(args: AdminListService): ThunkResponse<ListStoragePolicyResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getStoragePolicyDetail(id: number, countEntity?: boolean): ThunkResponse<AdminStoragePolicy> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/${id}`,
        { method: "GET", params: { countEntity: countEntity ? true : undefined } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertStoragePolicy(args: UpsertStoragePolicyService): ThunkResponse<AdminStoragePolicy> {
  return async (dispatch, _getState) => {
    const method = args.policy.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/file/admin/policy`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getNodeList(args: AdminListService): ThunkResponse<ListNodeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/node`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getNodeDetail(id: number): ThunkResponse<Node> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/node/${id}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertNode(args: UpsertNodeService): ThunkResponse<Node> {
  return async (dispatch, _getState) => {
    const method = args.node.id ? "PUT" : "POST"
    return await dispatch(
      send(
        `/file/admin/node`,
        {
          method: method,
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendClearBlobUrlCache(): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/tool/entityUrlCache`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createStoragePolicyCors(args: CreateStoragePolicyCorsService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/cors`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthRedirectUrl(): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/oauth/redirect`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthCredentialRefreshTime(id: string): ThunkResponse<OauthCredentialStatus> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/oauth/status/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthUrl(args: GetOauthRedirectService): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/oauth/signin`,
        { method: "GET", params: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function finishOauthCallback(args: FinishOauthCallbackService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/oauth/callback`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getOneDriveDriverRoot(id: number, url: string): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/oauth/root/${id}`,
        { method: "GET", params: { url } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteStoragePolicy(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/policy/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getGroupDetail(id: number, countUser?: boolean): ThunkResponse<Group> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/group/${id}`,
        { method: "GET", params: { countUser: countUser ? true : undefined } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertGroup(args: UpsertGroupService): ThunkResponse<Group> {
  return async (dispatch, _getState) => {
    const method = args.group.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/user/admin/group`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteGroup(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/group/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteNode(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/node/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function testNode(args: TestNodeService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/node/test`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function testNodeDownloader(args: TestNodeDownloaderService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/node/test/downloader`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserList(args: AdminListService): ThunkResponse<ListUserResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/user`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserDetail(id: number): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/user/info/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertUser(args: UpsertUserService): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    const method = args.user.user.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/user/admin/user`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteUser(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/user/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getFlattenFileList(args: AdminListService): ThunkResponse<ListFileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/file`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileDetail(id: number): ThunkResponse<FileEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/file/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertFile(args: UpsertFileService): ThunkResponse<FileEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/file${args.file.file.id ? `/${args.file.file.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileUrl(id: number): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/file/url/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteFiles(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/file/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getEntityList(args: AdminListService): ThunkResponse<ListEntityResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/entity`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getEntityDetail(id: number): ThunkResponse<Entity> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/entity/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getEntityUrl(id: number): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/entity/url/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteEntities(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/entity/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTaskList(args: AdminListService, service?: ServiceName): ThunkResponse<ListTaskResponse> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.file;
    return await dispatch(
      send(
        `/admin/${service}/queue`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTaskDetail(id: number, service?: ServiceName): ThunkResponse<Task> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.file;
    return await dispatch(
      send(
        `/admin/${service}/queue/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteTasks(args: BatchIDService, service?: ServiceName): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.file;
    return await dispatch(
      send(
        `/admin/${service}/queue/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShareList(args: AdminListService): ThunkResponse<AdminListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/share`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShareDetail(id: number): ThunkResponse<ShareEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/share/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteShares(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/admin/share/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCalibrateUserStorage(id: number): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/admin/user/${id}/calibrate`,
        { method: "POST" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendImport(req: ImportWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/workflow/import",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendPatchViewSync(args: PatchViewSyncService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/file/view`,
        { method: "PATCH", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCleanupTask(args: CleanupTaskService, service?: ServiceName): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.file;
    return await dispatch(
      send(
        `/admin/${service}/queue/cleanup`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getArchiveListFiles(args: ArchiveListFilesService): ThunkResponse<ArchiveListFilesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/file/archive`,
        { method: "GET", params: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

// AI module API
export function batchDeleteApiKeys(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function createApiKey(args: AiApiKey): ThunkResponse<AiApiKey> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getApiKeyList(args: AdminListService): ThunkResponse<ListAiApiKeyResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getApiKeyDetail(id: number): ThunkResponse<AiApiKey> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateApiKey(args: AiApiKey): ThunkResponse<AiApiKey> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteApiKey(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/api-key/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getImageList(args: AdminListService): ThunkResponse<ListAiImageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/image/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateImage(id: number, isPublic: boolean): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/image/${id}`,
        { method: "PATCH", data: { isPublic } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteImages(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/image/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getImageDetail(id: number): ThunkResponse<AiImage> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/image/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteDocuments(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/document/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getDocumentList(args: AdminListService): ThunkResponse<ListAiKnowledgeDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/document/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDocumentDetail(id: number): ThunkResponse<AiKnowledgeDocument> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/document/${id}`,
        { method: "GET" },
        {
           ...defaultOpts,
        },
      ),
    );
  };
}

export function updateDocumentAdmin(args: AiKnowledgeDocument): ThunkResponse<AiKnowledgeDocument> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/document/${args.id}`,
        { method: "PUT", data: args },
        {
           ...defaultOpts,
        },
      ),
    );
  };
}

export function updateDocumentStatus(id: number, status: Status): ThunkResponse<AiKnowledgeDocument> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/document/${id}/status`,
        { method: "PATCH", data: { status } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertDocument(args: AiKnowledgeDocument): ThunkResponse<AiKnowledgeDocument> {
  return async(dispatch, _geState) => {
    const method = args.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/admin/ai/document${args.id ? `/${args.id}` : ""}`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  }
}

export function getKnowledgeList(args: AdminListService): ThunkResponse<ListAiKnowledgeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getKnowledgeDetail(id: number): ThunkResponse<AiKnowledge> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/${id}`,
        { method: "GET" },
        {
           ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteKnowledges(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertKnowledge(args: AiKnowledgeModel): ThunkResponse<AiKnowledge> {
  return async (dispatch, _getState) => {
    const method = args.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/admin/ai/knowledge${args.id ? `/${args.id}` : ""}`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSegmentList(args: AdminListService): ThunkResponse<ListAiKnowledgeSegmentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/segment/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSegmentDetail(id: number): ThunkResponse<AiKnowledgeSegment> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/segment/${id}`,
        { method: "GET" },
        {
           ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteSegments(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/knowledge/segment/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getToolList(args: AdminListService): ThunkResponse<ListAiToolResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getToolDetail(id: number): ThunkResponse<AiTool> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createTool(args: AiTool): ThunkResponse<AiTool> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateTool(args: AiTool): ThunkResponse<AiTool> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteTool(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteTools(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/tool/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function createModel(args: AiModel): ThunkResponse<AiModel> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteModel(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteModels(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getModelList(args: AdminListService): ThunkResponse<ListAiModelResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getModelDetail(id: number): ThunkResponse<AiModel> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateModel(args: AiModel): ThunkResponse<AiModel> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/model/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteChatRole(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/role/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteChatRoles(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/role/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getChatRoleList(args: AdminListService): ThunkResponse<ListAiChatRoleResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/role/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getChatRoleDetail(id: number): ThunkResponse<AiChatRole> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/admin/role/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertRole(args: AiChatRoleModel): ThunkResponse<AiChatRole> {
  return async (dispatch, _getState) => {
    const method = args.id ? "PUT" : "POST";
    return await dispatch(
      send(
        `/admin/ai/role${args.id ? `/${args.id}` : ""}`,
        { method, data: args },
        {
          ...defaultOpts,
        },
      )
    )
  }
}

export function getChatConversationDetail(id: number): ThunkResponse<AiChatConversation> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/conversation/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getChatConversationList(args: AdminListService): ThunkResponse<ListAiChatConversationResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/conversation/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteChatConversations(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/conversation/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function getChatMessageDetail(id: number): ThunkResponse<AiChatMessage> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/message/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getChatMessageList(args: AdminListService): ThunkResponse<ListAiChatMessageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/message/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteChatMessages(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/ai/chat/message/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function createChatConversation(args: CreateChatConversationRequest): ThunkResponse<GetChatConversationResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  }
}

export function updateChatConversation(args: UpdateChatConversationRequest): ThunkResponse<GetChatConversationResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listMyChatConversations(): ThunkResponse<ListAllConversationsResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/list/me`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getChatConversation(id: string): ThunkResponse<GetChatConversationResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteChatConversation(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteUnpinnedChatConversation(): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/unpinned`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listChatConversations(args: ListConversactionRequest): ThunkResponse<ListConversationResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/conversation/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMessage(args: SendMessageRequest): ThunkResponse<SendMessageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMessageStream(args: SendMessageRequest): ThunkResponse<EventSource> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/stream`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function retryMessage(args: RetryMessageRequest): ThunkResponse<SendMessageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${args.id}/retry`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function retryMessageStream(args: RetryMessageRequest): ThunkResponse<EventSource> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${args.id}/retry/stream`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function patchMessage(args: PatchMessageRequest): ThunkResponse<SendMessageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${args.id}`,
        { method: "PATCH", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function patchMessageStream(args: PatchMessageRequest): ThunkResponse<EventSource> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${args.id}/stream`,
        { method: "PATCH", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
} 

export function deleteMessage(args: DeleteMessageRequest): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${args.id}?cascade=${args.cascade}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteChatMessage(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listConversationMessages(args: ListConversationMessagesRequest): ThunkResponse<ListConversationMessagesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/chat/message/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteImage(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/image/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getImage(id: string): ThunkResponse<GetUrlResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/image/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listImages(args: ListImagesRequest): ThunkResponse<ListImagesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/image/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function GetImages(ids: string[]): ThunkResponse<GetImageResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/image/some`,
        { method: "POST", data: { ids } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createKnowledge(args: UpsertKnowledgeRequest): ThunkResponse<GetKnowledgeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateKnowledge(id: string, args: UpsertKnowledgeRequest): ThunkResponse<GetKnowledgeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/${id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getKnowledgeInfo(id: string): ThunkResponse<GetKnowledgeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteKnowledge(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listKnowledge(args: ListKnowledgeRequest): ThunkResponse<ListKnowledgeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getKnowledgeStats(id: string): ThunkResponse<GetKnowledgeStatsResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/${id}/stats`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createDocument(args: UpsertDocumentRequest): ThunkResponse<UpsertDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createMultiDocuments(args: BatchCreateDocumentRequest): ThunkResponse<BatchUpsertDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/create`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateDocument(args: UpsertDocumentRequest): ThunkResponse<UpsertDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function reindexDocument(id: string): ThunkResponse<ReindexDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/${id}/reindex`,
        { method: "POST" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchReindexDocuments(ids: string[]): ThunkResponse<BatchReindexDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/reindex`,
        { method: "POST", data: { ids } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDocumentInfo(id: string): ThunkResponse<GetDocumentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDocumentProgress(id: string): ThunkResponse<GetDocumentProgressResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/progress/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteDocument(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listDocuments(args: ListDocumentsRequest): ThunkResponse<ListDocumentsResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteMultiDocuments(ids: string[]): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/knowledge/document/delete`,
        { method: "POST", data: { ids } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createRole(args: UpsertRoleRequest): ThunkResponse<GetRoleResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/role`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updateRole(args: UpsertRoleRequest): ThunkResponse<GetRoleResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/role/${args.id}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getRole(id: string): ThunkResponse<GetRoleResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/role/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listRoles(args: ListRolesRequest): ThunkResponse<ListRolesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/role/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getModel(id: string): ThunkResponse<GetModelResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/model/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listModels(args: ListModelRequest): ThunkResponse<ListModelResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/model/list/me`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDefaultModel(type: string): ThunkResponse<GetModelResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/model/default`,
        { method: "POST", data: { type } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function listTasks(args: ListTaskRequest, service?: ServiceName): ThunkResponse<TaskListResponse> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.ai;
    return await dispatch(
      send(
        `/${service}/workflow/list`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTask(id: string, service?: ServiceName): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.ai;
    return await dispatch(
      send(
        `/${service}/workflow/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTaskProgress(id: string, service?: ServiceName): ThunkResponse<TaskProgresses> {
  return async (dispatch, _getState) => {
    service = service || ServiceName.ai;
    return await dispatch(
      send(
        `/${service}/workflow/${id}/progress`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function cancelTasks(args: CancelTaskRequest): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/workflow/cancel`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function cancelTask(args: CancelTaskRequest): ThunkResponse<void> {
  return cancelTasks(args);
}

export function resumeTasks(args: ResumeTaskRequest): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/ai/workflow/resume`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}
