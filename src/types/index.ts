import { z } from "zod";
import { CreateEntrySchema } from "../validation/entries/create-entry-schema.js";
import { FindEntrySchema } from "../validation/entries/find-entry-schema.js";
import { DeleteEntrySchema } from "../validation/entries/delete-entry-schema.js";
import { EditEntrySchema } from "../validation/entries/edit-entry-schema.js";
import {
  ReadResourceTemplateCallback,
  ResourceMetadata,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { FindProjectSchema } from "../validation/projects/find-project-schema.js";

export type TCreateEntrySchema = z.infer<typeof CreateEntrySchema>;

export type TFindEntrySchema = z.infer<typeof FindEntrySchema>;

export type TDeleteEntrySchema = z.infer<typeof DeleteEntrySchema>;

export type TEditEntrySchema = z.infer<typeof EditEntrySchema>;

export type TFindProjectSchema = z.infer<typeof FindProjectSchema>;

export interface ClockifyWorkspace {
  id: string;
  name: string;
}

export interface ClockifyUser {
  id: string;
  name: string;
  email: string;
}

export interface McpToolConfig {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<McpResponse>;
}

export type McpToolConfigWithoutParameters = Omit<McpToolConfig, "parameters">;

export interface McpTextContent {
  type: "text";
  text: string;
  [key: string]: unknown;
}

export interface McpImageContent {
  type: "image";
  data: string;
  mimeType: string;
  [key: string]: unknown;
}

export interface McpResourceConfig {
  name: string;
  template: ResourceTemplate;
  metadata: ResourceMetadata;
  handler: ReadResourceTemplateCallback;
}

export interface McpResourceContent {
  type: "resource";
  resource:
    | {
        text: string;
        uri: string;
        mimeType?: string;
        [key: string]: unknown;
      }
    | {
        uri: string;
        blob: string;
        mimeType?: string;
        [key: string]: unknown;
      };
  [key: string]: unknown;
}

export type McpContent = McpTextContent | McpImageContent | McpResourceContent;

export interface McpResponse {
  content: McpContent[];
  _meta?: Record<string, unknown>;
  isError?: boolean;
  [key: string]: unknown;
}
