import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ServiceName } from "../../../api/common.ts";

interface TaskServiceSelectorProps {
  value: ServiceName;
  onChange: (value: ServiceName) => void;
}

const TaskServiceSelector = ({ value, onChange }: TaskServiceSelectorProps) => {
  const { t } = useTranslation("dashboard");

  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <Select value={value} onChange={(event: SelectChangeEvent<ServiceName>) => onChange(event.target.value as ServiceName)}>
        {Object.values(ServiceName).map((service) => (
          <MenuItem key={service} value={service}>
            {t(`task.service.${service}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TaskServiceSelector;
