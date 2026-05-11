import { FormControl, ListItemText, SelectChangeEvent } from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Status } from "../../../api/dashboard";
import { DenseSelect } from "../../Common/StyledComponents";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu";
import { AI_API_KEY_PLATFORMS, AI_MODEL_TYPES, AiStatusFilterValue } from "./constants";

interface AiOptionSelectProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface AiStatusSelectProps {
  value?: AiStatusFilterValue;
  onChange: (value: AiStatusFilterValue) => void;
  required?: boolean;
  includeAll?: boolean;
}

const platformLabels: Record<(typeof AI_API_KEY_PLATFORMS)[number], string> = {
  openai: "OpenAI",
  qwen: "Qwen",
  deepseek: "DeepSeek",
  ark: "ARK",
  qianfan: "Qianfan",
  ollama: "Ollama",
  gemini: "Gemini",
  claude: "Claude",
};

const renderOption = (value: string | number, label: ReactNode = value) => (
  <SquareMenuItem key={value} value={value}>
    <ListItemText primary={label} slotProps={{ primary: { variant: "body2" } }} />
  </SquareMenuItem>
);

export const AiApiKeyPlatformSelect = ({ value, onChange, required }: AiOptionSelectProps) => (
  <FormControl fullWidth required={required}>
    <DenseSelect value={value ?? ""} onChange={(e: SelectChangeEvent<unknown>) => onChange(e.target.value as string)} required={required}>
      {AI_API_KEY_PLATFORMS.map((platform) => renderOption(platform, platformLabels[platform]))}
    </DenseSelect>
  </FormControl>
);

export const AiModelTypeSelect = ({ value, onChange, required }: AiOptionSelectProps) => (
  <FormControl fullWidth required={required}>
    <DenseSelect value={value ?? ""} onChange={(e: SelectChangeEvent<unknown>) => onChange(e.target.value as string)} required={required}>
      {AI_MODEL_TYPES.map((type) => renderOption(type))}
    </DenseSelect>
  </FormControl>
);

export const AiStatusSelect = ({ value, onChange, required, includeAll }: AiStatusSelectProps) => {
  const { t } = useTranslation("dashboard");

  return (
    <FormControl fullWidth required={required}>
      <DenseSelect
        value={value ?? (includeAll ? "" : Status.active)}
        onChange={(e: SelectChangeEvent<unknown>) => onChange(e.target.value as AiStatusFilterValue)}
        required={required}
      >
        {includeAll && renderOption("", <em>{t("common.all")}</em>)}
        {renderOption(Status.active, t("common.status_active"))}
        {renderOption(Status.inactive, t("common.status_inactive"))}
      </DenseSelect>
    </FormControl>
  );
};
