import { z } from "zod";

export const CommonReportFiltersSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  dateRangeStart: z
    .string()
    .describe("Start of date range in ISO 8601 format (e.g. 2024-01-01T00:00:00.000Z)"),
  dateRangeEnd: z
    .string()
    .describe("End of date range in ISO 8601 format (e.g. 2024-12-31T23:59:59.000Z)"),
  projectIds: z
    .array(z.string())
    .optional()
    .describe("Filter by project IDs"),
  clientIds: z
    .array(z.string())
    .optional()
    .describe("Filter by client IDs"),
  userIds: z
    .array(z.string())
    .optional()
    .describe("Filter by user IDs"),
  tagIds: z
    .array(z.string())
    .optional()
    .describe("Filter by tag IDs"),
  rawFilters: z
    .record(z.any())
    .optional()
    .describe("Advanced filters merged into the request body, overriding other filter values. Use for invoicing state, approval state, custom fields, etc."),
});

export type TCommonReportFilters = z.infer<typeof CommonReportFiltersSchema>;
