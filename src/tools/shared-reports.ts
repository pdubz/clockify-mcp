import { z } from "zod";
import { TOOLS_CONFIG } from "../config/api";
import { sharedReportsService } from "../clockify-sdk/shared-reports";
import { McpResponse, McpToolConfig } from "../types";
import {
  TListSharedReportsSchema,
  TGetSharedReportSchema,
  TCreateSharedReportSchema,
  TUpdateSharedReportSchema,
  TDeleteSharedReportSchema,
} from "../validation/reports/shared-report-schema";

export const listSharedReportsTool: McpToolConfig = {
  name: TOOLS_CONFIG.sharedReports.list.name,
  description: TOOLS_CONFIG.sharedReports.list.description,
  parameters: {
    workspaceId: z.string().describe("The ID of the workspace"),
  },
  handler: async (params: TListSharedReportsSchema): Promise<McpResponse> => {
    try {
      const response = await sharedReportsService.list(params.workspaceId);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to list shared reports: ${error.message}`);
    }
  },
};

export const getSharedReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.sharedReports.get.name,
  description: TOOLS_CONFIG.sharedReports.get.description,
  parameters: {
    workspaceId: z.string().describe("The ID of the workspace"),
    reportId: z.string().describe("The ID of the shared report"),
  },
  handler: async (params: TGetSharedReportSchema): Promise<McpResponse> => {
    try {
      const response = await sharedReportsService.get(params.workspaceId, params.reportId);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get shared report: ${error.message}`);
    }
  },
};

export const createSharedReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.sharedReports.create.name,
  description: TOOLS_CONFIG.sharedReports.create.description,
  parameters: {
    workspaceId: z.string().describe("The ID of the workspace"),
    name: z.string().describe("Name for the shared report"),
    reportType: z
      .enum(["DETAILED", "SUMMARY", "WEEKLY"])
      .describe("The type of report"),
    filter: z
      .record(z.any())
      .describe("Report filter configuration — the full report request body to save"),
  },
  handler: async (params: TCreateSharedReportSchema): Promise<McpResponse> => {
    try {
      const body = {
        name: params.name,
        type: params.reportType,
        filter: params.filter,
      };
      const response = await sharedReportsService.create(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: `Shared report created successfully. ID: ${response.data.id} Name: ${response.data.name}`,
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to create shared report: ${error.message}`);
    }
  },
};

export const updateSharedReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.sharedReports.update.name,
  description: TOOLS_CONFIG.sharedReports.update.description,
  parameters: {
    workspaceId: z.string().describe("The ID of the workspace"),
    reportId: z.string().describe("The ID of the shared report to update"),
    name: z.string().optional().describe("Updated name for the shared report"),
    filter: z
      .record(z.any())
      .optional()
      .describe("Updated report filter configuration"),
  },
  handler: async (params: TUpdateSharedReportSchema): Promise<McpResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.name !== undefined) body.name = params.name;
      if (params.filter !== undefined) body.filter = params.filter;

      const response = await sharedReportsService.update(params.workspaceId, params.reportId, body);
      return {
        content: [{
          type: "text",
          text: `Shared report updated successfully. ID: ${response.data.id} Name: ${response.data.name}`,
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to update shared report: ${error.message}`);
    }
  },
};

export const deleteSharedReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.sharedReports.delete.name,
  description: TOOLS_CONFIG.sharedReports.delete.description,
  parameters: {
    workspaceId: z.string().describe("The ID of the workspace"),
    reportId: z.string().describe("The ID of the shared report to delete"),
  },
  handler: async (params: TDeleteSharedReportSchema): Promise<McpResponse> => {
    try {
      await sharedReportsService.remove(params.workspaceId, params.reportId);
      return {
        content: [{
          type: "text",
          text: `Shared report ${params.reportId} deleted successfully.`,
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to delete shared report: ${error.message}`);
    }
  },
};
