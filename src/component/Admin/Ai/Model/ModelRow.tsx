import { Checkbox, IconButton, Link, Skeleton, TableCell, TableRow } from "@mui/material";
import { batchDeleteModels } from "../../../../api/api";
import { AiModel } from "../../../../api/dashboard";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../redux/hooks";
import { NoWrapTableCell, NoWrapTypography } from "../../../Common/StyledComponents";
import { Delete } from "@mui/icons-material";

export interface ModelRowProps {
  model?: AiModel;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openApiKeyDialog?: (id: number) => void;
}

const ModelRow = ({ model, loading, deleting, selected, onDelete, onDetails, onSelect, openApiKeyDialog }: ModelRowProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onRowClick = () => {
    onDetails?.(model?.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("model.confirmDelete", { model: model?.name }))).then(() => {
      if (model?.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteModels({ ids: [model.id] }))
          .then(() => {
            onDelete?.();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      }
    });
  };

  const onSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(model?.id ?? 0);
  };

  const onApiKeyClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const apiKeyID = model?.api_key?.id ?? model?.key_id;
    if (apiKeyID) {
      openApiKeyDialog?.(apiKeyID);
    }
  };

  const apiKeyID = model?.api_key?.id ?? model?.key_id;
  const apiKeyLabel = model?.api_key?.name ?? apiKeyID ?? "";

  if (loading) {
    return (
      <TableRow sx={{ height: "43px" }}>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  return (
    <TableRow hover key={model?.id} sx={{ cursor: "pointer" }} onClick={onRowClick} selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          disabled={deleting}
          size="small"
          disableRipple
          color="primary"
          onClick={onSelectClick}
          checked={selected}
        />
      </TableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.name}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.model}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.platform}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.sort}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.temperature}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.max_tokens}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{model?.max_contexts}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          {apiKeyID ? (
            <Link
              component="button"
              type="button"
              onClick={onApiKeyClick}
              underline="hover"
              sx={{ verticalAlign: "baseline" }}
            >
              {apiKeyLabel}
            </Link>
          ) : (
            apiKeyLabel
          )}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
          <Delete fontSize="small" />
        </IconButton>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default ModelRow;
