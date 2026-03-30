import { z } from "zod";
import { TOOLS_CONFIG } from "../config/api.js";
import { reportsService, buildReportRequestBody } from "../clockify-sdk/reports.js";
import { McpResponse, McpToolConfig } from "../types/index.js";
import { TDetailedReportSchema } from "../validation/reports/detailed-report-schema.js";
import { TSummaryReportSchema } from "../validation/reports/summary-report-schema.js";
import { TCommonReportFilters } from "../validation/reports/common-report-filters-schema.js";

const commonFilterParams = {
  workspaceId: z.string().describe("The ID of the workspace"),
  dateRangeStart: z
    .string()
    .describe("Start of date range in ISO 8601 format (e.g. 2024-01-01T00:00:00.000Z)"),
  dateRangeEnd: z
    .string()
    .describe("End of date range in ISO 8601 format (e.g. 2024-12-31T23:59:59.000Z)"),
  projectIds: z.array(z.string()).optional().describe("Filter by project IDs"),
  clientIds: z.array(z.string()).optional().describe("Filter by client IDs"),
  userIds: z.array(z.string()).optional().describe("Filter by user IDs"),
  tagIds: z.array(z.string()).optional().describe("Filter by tag IDs"),
  rawFilters: z
    .record(z.any())
    .optional()
    .describe("Advanced filters merged into the request body, overriding other filter values"),
};

export const getDetailedReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.detailed.name,
  description: TOOLS_CONFIG.reports.detailed.description,
  parameters: {
    ...commonFilterParams,
    page: z.number().optional().default(1).describe("Page number (default: 1)"),
    pageSize: z.number().optional().default(1000).describe("Entries per page (default: 1000)"),
    sortColumn: z
      .enum(["DATE", "DESCRIPTION", "USER", "PROJECT", "CLIENT", "DURATION", "TAG"])
      .optional()
      .default("DATE")
      .describe("Column to sort by (default: DATE)"),
    sortOrder: z
      .enum(["ASCENDING", "DESCENDING"])
      .optional()
      .default("ASCENDING")
      .describe("Sort order (default: ASCENDING)"),
    autoPaginate: z
      .boolean()
      .optional()
      .default(false)
      .describe("When true, fetches all pages and concatenates results"),
  },
  handler: async (params: TDetailedReportSchema): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      body.sortOrder = params.sortOrder;
      body.detailedFilter = {
        page: params.page,
        pageSize: params.pageSize,
        sortColumn: params.sortColumn,
        options: { totals: "CALCULATE" },
      };

      if (params.autoPaginate) {
        const allEntries: any[] = [];
        let currentPage = params.page;
        let totals: any = null;
        const MAX_PAGES = 100;

        while (currentPage - params.page < MAX_PAGES) {
          body.detailedFilter.page = currentPage;
          const response = await reportsService.getDetailedReport(params.workspaceId, body);
          const data = response.data;

          if (!totals && data.totals) {
            totals = data.totals;
          }

          if (data.timeentries) {
            allEntries.push(...data.timeentries);
          }

          const isLastPage = response.headers?.["last-page"] === "true" ||
            !data.timeentries ||
            data.timeentries.length < params.pageSize;

          if (isLastPage) break;
          currentPage++;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ timeentries: allEntries, totals }),
          }],
        };
      }

      const response = await reportsService.getDetailedReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get detailed report: ${error.message}`);
    }
  },
};

export const getSummaryReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.summary.name,
  description: TOOLS_CONFIG.reports.summary.description,
  parameters: {
    ...commonFilterParams,
    groups: z
      .array(z.enum(["PROJECT", "USER", "CLIENT", "TAG", "DATE", "TIMEENTRY", "MONTH"]))
      .min(1)
      .max(3)
      .describe("Grouping levels (1-3, e.g. ['PROJECT', 'USER'])"),
    sortColumn: z
      .enum(["GROUP", "DURATION", "AMOUNT"])
      .optional()
      .default("GROUP")
      .describe("Column to sort by (default: GROUP)"),
  },
  handler: async (params: TSummaryReportSchema): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      body.summaryFilter = {
        groups: params.groups,
        sortColumn: params.sortColumn,
      };

      const response = await reportsService.getSummaryReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get summary report: ${error.message}`);
    }
  },
};

export const getWeeklyReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.weekly.name,
  description: TOOLS_CONFIG.reports.weekly.description,
  parameters: { ...commonFilterParams },
  handler: async (params: TCommonReportFilters): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      const response = await reportsService.getWeeklyReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get weekly report: ${error.message}`);
    }
  },
};

export const getAttendanceReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.attendance.name,
  description: TOOLS_CONFIG.reports.attendance.description,
  parameters: { ...commonFilterParams },
  handler: async (params: TCommonReportFilters): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      const response = await reportsService.getAttendanceReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get attendance report: ${error.message}`);
    }
  },
};

export const getExpenseReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.expense.name,
  description: TOOLS_CONFIG.reports.expense.description,
  parameters: { ...commonFilterParams },
  handler: async (params: TCommonReportFilters): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      const response = await reportsService.getExpenseReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get expense report: ${error.message}`);
    }
  },
};

export const getAuditLogReportTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.auditLog.name,
  description: TOOLS_CONFIG.reports.auditLog.description,
  parameters: { ...commonFilterParams },
  handler: async (params: TCommonReportFilters): Promise<McpResponse> => {
    try {
      const body = buildReportRequestBody(params);
      const response = await reportsService.getAuditLogReport(params.workspaceId, body);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data),
        }],
      };
    } catch (error: any) {
      throw new Error(`Failed to get audit log report: ${error.message}`);
    }
  },
};
