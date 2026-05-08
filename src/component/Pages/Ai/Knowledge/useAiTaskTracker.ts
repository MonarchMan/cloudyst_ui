import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cancelTasks as cancelTasksApi, getTask, getTaskProgress, listTasks, resumeTasks as resumeTasksApi } from "../../../../api/api.ts";
import { ServiceName } from "../../../../api/common.ts";
import { TaskProgresses, TaskResponse, TaskStatus } from "../../../../api/workflow.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { DefaultCloseAction } from "../../../Common/Snackbar/snackbar.tsx";

export interface TrackedAiTaskSource {
  documentId?: string;
  url?: string;
}

export interface TrackedAiTask {
  id: string;
  knowledgeId: string;
  sources?: TrackedAiTaskSource[];
  progress?: number;
  status?: TaskStatus;
  error?: string;
  error_history?: string[];
}

interface UseAiTaskTrackerOptions {
  onTaskTick?: (knowledgeIds: string[]) => void;
}

const terminalTaskStatuses = new Set<TaskStatus>([
  TaskStatus.completed,
  TaskStatus.error,
  TaskStatus.canceled,
]);

const getTaskSourceUrls = (task: TaskResponse) => {
  const props = task.summary?.props;
  return [props?.src, props?.src_str, ...(props?.src_multiple ?? [])].filter((value): value is string => Boolean(value));
};

const calculateTaskProgress = (progresses: TaskProgresses) => {
  const values = Object.values(progresses);
  if (values.length === 0) {
    return undefined;
  }

  const total = values.reduce((sum, item) => sum + Math.max(item.total, 1), 0);
  const current = values.reduce((sum, item) => sum + item.current, 0);
  return Math.min(100, Math.max(0, Math.round((current / Math.max(total, 1)) * 100)));
};

const getStatusProgress = (status?: TaskStatus) => {
  if (status === TaskStatus.completed) {
    return 100;
  }

  return undefined;
};

export const useAiTaskTracker = ({ onTaskTick }: UseAiTaskTrackerOptions = {}) => {
  const { t } = useTranslation("application");
  const dispatch = useAppDispatch();
  const [tasks, setTasks] = useState<Record<string, TrackedAiTask>>({});
  const [failedTasks, setFailedTasks] = useState<Record<string, TrackedAiTask>>({});
  const tasksRef = useRef<Record<string, TrackedAiTask>>({});
  const tickRef = useRef(onTaskTick);
  const activeTaskKey = useMemo(() => Object.keys(tasks).sort().join(","), [tasks]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    tickRef.current = onTaskTick;
  }, [onTaskTick]);

  const registerTask = useCallback((args: { id?: string; knowledgeId: string; sources?: TrackedAiTaskSource[] }) => {
    if (!args.id) {
      return;
    }

    setTasks((prev) => ({
      ...prev,
      [args.id!]: {
        ...prev[args.id!],
        id: args.id!,
        knowledgeId: args.knowledgeId,
        sources: args.sources ?? prev[args.id!]?.sources,
      },
    }));
  }, []);

  const getTaskIds = useCallback((knowledgeId?: string, source: Record<string, TrackedAiTask> = tasksRef.current) => {
    return Object.values(source)
      .filter((task) => !knowledgeId || task.knowledgeId === knowledgeId)
      .map((task) => task.id);
  }, []);

  const cancelTasks = useCallback(
    async (knowledgeId?: string) => {
      const ids = getTaskIds(knowledgeId);
      if (ids.length === 0) {
        return;
      }

      await dispatch(cancelTasksApi({ id: ids }));
      enqueueSnackbar({
        message: t("ai.indexTasksCancelSubmitted", { count: ids.length }),
        variant: "info",
        action: DefaultCloseAction,
      });
    },
    [dispatch, getTaskIds, t],
  );

  const resumeTasks = useCallback(
    async (knowledgeId?: string) => {
      const ids = getTaskIds(knowledgeId, failedTasks);
      if (ids.length === 0) {
        return;
      }

      await dispatch(resumeTasksApi(ids));
      setTasks((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          const failedTask = failedTasks[id];
          if (failedTask) {
            next[id] = {
              ...failedTask,
              status: undefined,
              progress: undefined,
              error: undefined,
              error_history: undefined,
            };
          }
        });
        return next;
      });
      setFailedTasks((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          delete next[id];
        });
        return next;
      });
      enqueueSnackbar({
        message: t("ai.indexTasksResumeSubmitted", { count: ids.length }),
        variant: "info",
        action: DefaultCloseAction,
      });
    },
    [dispatch, failedTasks, getTaskIds, t],
  );

  useEffect(() => {
    if (!activeTaskKey) {
      return;
    }

    let cancelled = false;

    const refreshTaskState = async () => {
      const currentTasks = Object.values(tasksRef.current);
      if (currentTasks.length === 0) {
        return;
      }

      const taskStatusById = new Map<string, TaskResponse>();
      try {
        const taskList = await dispatch(listTasks({ page: 1, page_size: 50 }, ServiceName.ai));
        taskList.tasks.forEach((task) => {
          if (tasksRef.current[task.id]) {
            taskStatusById.set(task.id, task);
          }
        });
      } catch (_e) {
        // Keep progress polling alive even if task listing briefly fails.
      }

      const nextTasks: Record<string, TrackedAiTask> = {};
      const nextFailedTasks: Record<string, TrackedAiTask> = {};
      const affectedKnowledgeIds = new Set<string>();
      let changed = false;

      await Promise.all(
        currentTasks.map(async (task) => {
          let taskDetail: TaskResponse | undefined;
          let progress = task.progress;
          try {
            taskDetail = await dispatch(getTask(task.id, ServiceName.ai));
          } catch (_e) {
            taskDetail = undefined;
          }
          try {
            progress = calculateTaskProgress(await dispatch(getTaskProgress(task.id, ServiceName.ai))) ?? progress;
          } catch (_e) {
            progress = task.progress;
          }

          const statusInfo = taskDetail ?? taskStatusById.get(task.id);
          const sourceUrls = statusInfo ? getTaskSourceUrls(statusInfo) : [];
          const nextStatus = statusInfo?.status ?? task.status;
          const sources = task.sources ?? sourceUrls.map((url) => ({ url }));
          const nextTask: TrackedAiTask = {
            ...task,
            sources,
            progress: getStatusProgress(nextStatus) ?? progress,
            status: nextStatus,
            error: statusInfo?.error ?? task.error,
            error_history: statusInfo?.error_history ?? task.error_history,
          };

          affectedKnowledgeIds.add(task.knowledgeId);

          if (nextTask.status && terminalTaskStatuses.has(nextTask.status)) {
            changed = true;
            if (nextTask.status === TaskStatus.error || nextTask.status === TaskStatus.canceled) {
              nextFailedTasks[task.id] = nextTask;
            }
            enqueueSnackbar({
              message: t(nextTask.status === TaskStatus.completed ? "ai.indexTaskCompleted" : "ai.indexTaskFailed"),
              variant: nextTask.status === TaskStatus.completed ? "success" : "error",
              action: DefaultCloseAction,
            });
            return;
          }

          nextTasks[task.id] = nextTask;
          if (
            nextTask.progress !== task.progress ||
            nextTask.status !== task.status ||
            nextTask.error !== task.error ||
            nextTask.error_history !== task.error_history
          ) {
            changed = true;
          }
        }),
      );

      if (cancelled) {
        return;
      }

      if (changed) {
        setTasks(nextTasks);
        setFailedTasks((prev) => ({ ...prev, ...nextFailedTasks }));
      }

      tickRef.current?.(Array.from(affectedKnowledgeIds));
    };

    refreshTaskState().catch(() => undefined);
    const timer = window.setInterval(() => {
      refreshTaskState().catch(() => undefined);
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeTaskKey, dispatch, t]);

  const summary = useMemo(() => {
    const values = Object.values(tasks);
    const progresses = values
      .map((task) => task.progress)
      .filter((progress): progress is number => progress !== undefined);

    return {
      count: values.length,
      progress: progresses.length > 0
        ? Math.round(progresses.reduce((sum, progress) => sum + progress, 0) / progresses.length)
        : undefined,
    };
  }, [tasks]);

  const summaryByKnowledge = useMemo(() => {
    const grouped = Object.values(tasks).reduce<Record<string, { count: number; progressTotal: number; progressCount: number }>>(
      (acc, task) => {
        const current = acc[task.knowledgeId] ?? { count: 0, progressTotal: 0, progressCount: 0 };
        current.count += 1;
        if (task.progress !== undefined) {
          current.progressTotal += task.progress;
          current.progressCount += 1;
        }
        acc[task.knowledgeId] = current;
        return acc;
      },
      {},
    );

    return Object.entries(grouped).reduce<Record<string, { count: number; progress?: number }>>((acc, [knowledgeId, value]) => {
      acc[knowledgeId] = {
        count: value.count,
        progress: value.progressCount > 0 ? Math.round(value.progressTotal / value.progressCount) : undefined,
      };
      return acc;
    }, {});
  }, [tasks]);

  const failureByDocumentId = useMemo(() => {
    return Object.values(failedTasks).reduce<Record<string, string>>((acc, task) => {
      const error = task.error || task.error_history?.join("\n");
      if (!error) {
        return acc;
      }

      task.sources?.forEach((source) => {
        if (source.documentId) {
          acc[source.documentId] = error;
        }
      });
      return acc;
    }, {});
  }, [failedTasks]);

  const resumableSummary = useMemo(() => {
    const values = Object.values(failedTasks);
    return {
      count: values.length,
      byKnowledge: values.reduce<Record<string, number>>((acc, task) => {
        acc[task.knowledgeId] = (acc[task.knowledgeId] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }, [failedTasks]);

  return useMemo(() => ({
    registerTask,
    cancelTasks,
    resumeTasks,
    tasks,
    failedTasks,
    summary,
    summaryByKnowledge,
    resumableSummary,
    failureByDocumentId,
  }), [cancelTasks, failedTasks, failureByDocumentId, registerTask, resumeTasks, resumableSummary, summary, summaryByKnowledge, tasks]);
};
