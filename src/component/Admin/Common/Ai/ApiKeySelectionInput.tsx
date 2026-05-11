import { useEffect, useState } from "react";
import { AiApiKey } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { getApiKeyList } from "../../../../api/api";
import { Box, FormControl, ListItemText, Typography } from "@mui/material";
import { DenseSelect } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";
import { useTranslation } from "react-i18next";

export interface ApiKeySelectionInputProps {
  value: number;
  onChange: (value: number) => void;
  onChangeApiKey?: (apikey?: AiApiKey) => void;
  emptyValue?: string | number;
  emptyText?: string;
  fullWidth?: boolean;
  required?: boolean;
}

const ApiKeySelectionInput = ({
  value,
  onChange,
  onChangeApiKey,
  emptyValue,
  emptyText,
  fullWidth,
  required,
}: ApiKeySelectionInputProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<AiApiKey[]>([]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      getApiKeyList({
        page_size: 1000,
        page: 1,
        order_by: "id",
        order_direction: "asc",
      }),
    )
    .then((res) => {
      setApiKeys(res.api_keys);
    })
    .finally(() => {
      setLoading(false);
    })
  }, []);

  const hanldeChange = (value: string | number) => {
    const nextValue = Number(value);
    onChange(nextValue);
    onChangeApiKey?.(apiKeys.find((k) => k.id === nextValue));
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <DenseSelect
        disabled={loading}
        value={value}
        onChange={(e) => hanldeChange(e.target.value as number)}
        required={required}
      >
        {
          apiKeys
            .map((k) => (
              <SquareMenuItem value={k.id} key={k.id}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant={"body2"} fontWeight={600}>
                    {k.name}
                  </Typography>
                  <Typography variant={"caption"} color={"textSecondary"}>
                    {k.platform}
                  </Typography>
                </Box>
              </SquareMenuItem>
            ))
        }
        {emptyValue !== undefined && emptyText && (
          <SquareMenuItem value={emptyValue}>
            <ListItemText
              primary={<em>{t(emptyText)}</em>}
              slotProps={{
                primary: { variant: "body2"}
              }} />
          </SquareMenuItem>
        )}
      </DenseSelect>
    </FormControl>
  );
};

export default ApiKeySelectionInput;
