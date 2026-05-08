import { useEffect, useState } from "react";
import { AiModel } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { getModelList } from "../../../../api/api";
import { Alert, Box, FormControl, ListItemText, Typography } from "@mui/material";
import { DenseSelect } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";
import { useTranslation } from "react-i18next";

export interface ModelSelectionInputProps {
  value: number;
    onChange: (value: number) => void;
    onChangeModel?: (apikey?: AiModel) => void;
    emptyValue?: string;
    emptyText?: string;
    fullWidth?: boolean;
    required?: boolean;
}

const ModelSelectionInput = ({
  value,
  onChange,
  onChangeModel,
  emptyValue,
  emptyText,
  fullWidth,
  required,
}: ModelSelectionInputProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModel[]>([]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      getModelList({
        page_size: 1000,
        page: 1,
        order_by: "id",
        order_direction: "asc",
      }),
    )
    .then((res) => {
      setModels(res.models);
    })
    .finally(() => {
      setLoading(false);
    })
  }, []);

  const hanldeChange = (value: number) => {
    onChange(value);
    onChangeModel?.(models.find((m) => m.id === value));
  };

  if (!loading && models.length == 0) {
    return <Alert severity="warning">{t("settings.noModels")}</Alert>
  }

  return (
    <FormControl fullWidth={fullWidth}>
      <DenseSelect
        disabled={loading}
        value={value}
        onChange={(e) => hanldeChange(e.target.value as number)}
        required={required}
      >
        {
          models
            .map((m) => (
              <SquareMenuItem value={m.id}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant={"body2"} fontWeight={600}>
                    {m.name}
                  </Typography>
                  <Typography variant={"caption"} color={"textSecondary"}>
                    {m.platform}
                  </Typography>
                </Box>
              </SquareMenuItem>
            ))
        }
        {emptyValue !== undefined && emptyText && (
          <SquareMenuItem value={emptyValue}>
            <ListItemText
              primary={<em>{emptyText}</em>}
              slotProps={{
                primary: { variant: "body2"}
              }} />
          </SquareMenuItem>
        )}
      </DenseSelect>
    </FormControl>
  );
};

export default ModelSelectionInput;
