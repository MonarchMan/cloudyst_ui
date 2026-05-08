import { Box, Link, List, ListItem, Typography } from "@mui/material";
import React, { Fragment, ReactNode, useMemo } from "react";

interface ChatRichTextProps {
  content?: string;
  color?: string;
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level: number }
  | { type: "blockquote"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; code: string; language?: string };

type InlineToken =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

const codeBlockPattern = /```([\w-]*)\n?([\s\S]*?)```/g;
const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const plainLinkPattern = /https?:\/\/[^\s]+/g;

const parseBlocks = (content: string): Block[] => {
  const blocks: Block[] = [];
  let cursor = 0;

  const pushTextBlocks = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const groups = trimmed.split(/\n{2,}/);
    groups.forEach((group) => {
      const lines = group
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      if (!lines.length) {
        return;
      }

      const heading = lines[0].match(/^(#{1,6})\s+(.*)$/);
      if (heading && lines.length === 1) {
        blocks.push({
          type: "heading",
          level: heading[1].length,
          text: heading[2],
        });
        return;
      }

      if (lines.every((line) => line.startsWith(">"))) {
        blocks.push({
          type: "blockquote",
          lines: lines.map((line) => line.replace(/^>\s?/, "")),
        });
        return;
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        blocks.push({
          type: "list",
          ordered: false,
          items: lines.map((line) => line.replace(/^[-*]\s+/, "")),
        });
        return;
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        blocks.push({
          type: "list",
          ordered: true,
          items: lines.map((line) => line.replace(/^\d+\.\s+/, "")),
        });
        return;
      }

      blocks.push({
        type: "paragraph",
        text: lines.join("\n"),
      });
    });
  };

  content.replace(codeBlockPattern, (match, language: string, code: string, offset: number) => {
    pushTextBlocks(content.slice(cursor, offset));
    blocks.push({
      type: "code",
      code: code.replace(/\n$/, ""),
      language: language || undefined,
    });
    cursor = offset + match.length;
    return match;
  });

  pushTextBlocks(content.slice(cursor));
  return blocks;
};

const parseInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  let cursor = 0;
  const pattern = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

  text.replace(pattern, (match, code: string, linkText: string, markdownHref: string, plainHref: string, offset: number) => {
    if (offset > cursor) {
      tokens.push({ type: "text", text: text.slice(cursor, offset) });
    }

    if (code) {
      tokens.push({ type: "code", text: code });
    } else if (markdownHref) {
      tokens.push({ type: "link", text: linkText, href: markdownHref });
    } else if (plainHref) {
      tokens.push({ type: "link", text: plainHref, href: plainHref });
    }

    cursor = offset + match.length;
    return match;
  });

  if (cursor < text.length) {
    tokens.push({ type: "text", text: text.slice(cursor) });
  }

  return tokens;
};

const renderInline = (text: string) => {
  return parseInline(text).map((token, index) => {
    if (token.type === "code") {
      return (
        <Box
          key={`inline-${index}`}
          component="code"
          sx={{
            px: 0.5,
            py: 0.15,
            borderRadius: 0.75,
            bgcolor: "action.selected",
            fontFamily: "monospace",
            fontSize: "0.9em",
          }}
        >
          {token.text}
        </Box>
      );
    }

    if (token.type === "link") {
      return (
        <Link
          key={`inline-${index}`}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ wordBreak: "break-all" }}
        >
          {token.text}
        </Link>
      );
    }

    return <Fragment key={`inline-${index}`}>{token.text}</Fragment>;
  });
};

const stripMarkdownForList = (text: string) =>
  text.replace(markdownLinkPattern, "$1").replace(plainLinkPattern, (match) => match);

const ChatRichText = ({ content, color }: ChatRichTextProps) => {
  const blocks = useMemo(() => parseBlocks(content ?? ""), [content]);

  if (!content?.trim()) {
    return null;
  }

  const renderBlock = (block: Block, index: number): ReactNode => {
    if (block.type === "heading") {
      const variant = block.level <= 2 ? "subtitle1" : "body1";
      return (
        <Typography key={`block-${index}`} variant={variant} fontWeight={700} sx={{ color }}>
          {renderInline(block.text)}
        </Typography>
      );
    }

    if (block.type === "blockquote") {
      return (
        <Box
          key={`block-${index}`}
          sx={{
            borderLeft: "3px solid",
            borderColor: "divider",
            pl: 1.5,
            py: 0.25,
            color,
            opacity: 0.88,
          }}
        >
          {block.lines.map((line, lineIndex) => (
            <Typography key={`quote-${lineIndex}`} variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {renderInline(line)}
            </Typography>
          ))}
        </Box>
      );
    }

    if (block.type === "list") {
      return (
        <List key={`block-${index}`} dense disablePadding sx={{ pl: 1.5, color, listStyleType: block.ordered ? "decimal" : "disc" }}>
          {block.items.map((item, itemIndex) => (
            <ListItem
              key={`item-${itemIndex}`}
              sx={{
                display: "list-item",
                py: 0.25,
                px: 0,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color }}>
                {renderInline(stripMarkdownForList(item))}
              </Typography>
            </ListItem>
          ))}
        </List>
      );
    }

    if (block.type === "code") {
      return (
        <Box
          key={`block-${index}`}
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: "rgba(15, 23, 42, 0.9)",
            color: "#e2e8f0",
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          {block.language && (
            <Typography variant="caption" sx={{ display: "block", color: "rgba(226, 232, 240, 0.72)", mb: 0.75 }}>
              {block.language}
            </Typography>
          )}
          <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {block.code}
          </Box>
        </Box>
      );
    }

    return (
      <Typography
        key={`block-${index}`}
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color,
        }}
      >
        {renderInline(block.text)}
      </Typography>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </Box>
  );
};

export default ChatRichText;
