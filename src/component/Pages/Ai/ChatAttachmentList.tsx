import { Box, Chip, Stack } from "@mui/material";
import React from "react";
import { fileBase } from "../../../util";
import CrUri from "../../../util/uri.ts";
import Document from "../../Icons/Document.tsx";
import ImageOutlined from "../../Icons/ImageOutlined.tsx";
import LinkOutlined from "../../Icons/LinkOutlined.tsx";

interface ChatAttachmentListProps {
  attachments?: string[];
  onRemove?: (url: string) => void;
}

const imageExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"]);

const getExtension = (value: string) => {
  const clean = value.split("?")[0].split("#")[0];
  const segments = clean.split(".");
  return segments.length > 1 ? segments.pop()?.toLowerCase() ?? "" : "";
};

const getAttachmentLabel = (url: string) => {
  if (url.startsWith("cloudyst://")) {
    try {
      const crUri = new CrUri(url);
      const name = crUri.elements().at(-1);
      return name || url;
    } catch {
      return url;
    }
  }

  try {
    const parsed = new URL(url);
    return decodeURIComponent(fileBase(parsed.pathname) || parsed.hostname || url);
  } catch {
    return decodeURIComponent(fileBase(url) || url);
  }
};

const getAttachmentIcon = (url: string) => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (imageExtensions.has(getExtension(url))) {
      return <ImageOutlined sx={{ fontSize: 16 }} />;
    }
    return <LinkOutlined sx={{ fontSize: 16 }} />;
  }

  if (imageExtensions.has(getExtension(url))) {
    return <ImageOutlined sx={{ fontSize: 16 }} />;
  }

  return <Document sx={{ fontSize: 16 }} />;
};

const ChatAttachmentList = ({ attachments, onRemove }: ChatAttachmentListProps) => {
  if (!attachments?.length) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {attachments.map((url) => {
        const isExternal = url.startsWith("http://") || url.startsWith("https://");

        return (
          <Box key={url}>
            <Chip
              icon={getAttachmentIcon(url)}
              label={getAttachmentLabel(url)}
              clickable={isExternal}
              onClick={isExternal ? () => window.open(url, "_blank", "noopener,noreferrer") : undefined}
              onDelete={onRemove ? () => onRemove(url) : undefined}
              sx={{
                maxWidth: 280,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

export default ChatAttachmentList;
