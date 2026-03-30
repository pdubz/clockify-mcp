# Clockify Reporting API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 6 Clockify report types, shared reports CRUD, and npm publishing to the clockify-mcp server.

**Architecture:** Separate Axios instance (`reportsApi`) for `reports.api.clockify.me/v1`. New SDK services, validation schemas, and tool definitions following existing codebase patterns. Publish as `@pdubz/clockify-mcp` with npx support.

**Tech Stack:** TypeScript, Zod, Axios, MCP SDK, Node.js test runner

**Spec:** `docs/superpowers/specs/2026-03-29-reporting-api-design.md`

---

### Task 1: Add Reports API Client

**Files:**
- Modify: `src/config/api.ts`

- [ ] **Step 1: Add the `reportsApi` Axios instance to `src/config/api.ts`**

Add after the existing `api` instance (line 8):

```typescript
export const reportsApi = axios.create({
  baseURL: process.env.CLOCKIFY_REPORTS_API_URL || 'https://reports.api.clockify.me/v1',
  headers: {
    "X-Api-Key": `${process.env.CLOCKIFY_API_TOKEN}`,
  },
});
```

- [ ] **Step 2: Add report tool entries to `TOOLS_CONFIG`**

Add after the `entries` block in `TOOLS_CONFIG`:

```typescript
reports: {
  detailed: {
    name: "get-detailed-report",
    description: "Get a detailed time entry report with individual entries, filterable by date range, projects, clients, users, and tags",
  },
  summary: {
    name: "get-summary-report",
    description: "Get a summary report with aggregated time data, grouped by project, user, client, tag, date, or month",
  },
  weekly: {
    name: "get-weekly-report",
    description: "Get a weekly time report showing hours per day of the week",
  },
  attendance: {
    name: "get-attendance-report",
    description: "Get an attendance report showing work hours and break times",
  },
  expense: {
    name: "get-expense-report",
    description: "Get an expense report for the workspace",
  },
  auditLog: {
    name: "get-audit-log-report",
    description: "Get an audit log report showing workspace activity history",
  },
},
sharedReports: {
  list: {
    name: "list-shared-reports",
    description: "List all shared reports in a workspace",
  },
  get: {
    name: "get-shared-report",
    description: "Get a specific shared report by ID",
  },
  create: {
    name: "create-shared-report",
    description: "Create a new shared report in a workspace",
  },
  update: {
    name: "update-shared-report",
    description: "Update an existing shared report",
  },
  delete: {
    name: "delete-shared-report",
    description: "Delete a shared report from a workspace",
  },
},
```

- [ ] **Step 3: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/config/api.ts
git commit -m "feat: add reports API client and tools config entries"
```

---

### Task 2: Common Report Filters Validation Schema

**Files:**
- Create: `src/validation/reports/common-report-filters-schema.ts`

- [ ] **Step 1: Create the common report filters Zod schema**

```typescript
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
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/validation/reports/common-report-filters-schema.ts
git commit -m "feat: add common report filters validation schema"
```

---

### Task 3: Report-Specific Validation Schemas

**Files:**
- Create: `src/validation/reports/detailed-report-schema.ts`
- Create: `src/validation/reports/summary-report-schema.ts`
- Create: `src/validation/reports/weekly-report-schema.ts`
- Create: `src/validation/reports/attendance-report-schema.ts`
- Create: `src/validation/reports/expense-report-schema.ts`
- Create: `src/validation/reports/audit-log-report-schema.ts`

- [ ] **Step 1: Create detailed report schema**

File: `src/validation/reports/detailed-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const DetailedReportSchema = CommonReportFiltersSchema.extend({
  page: z
    .number()
    .optional()
    .default(1)
    .describe("Page number for pagination (default: 1)"),
  pageSize: z
    .number()
    .optional()
    .default(1000)
    .describe("Number of entries per page (default: 1000)"),
  sortColumn: z
    .enum(["DATE", "DESCRIPTION", "USER", "PROJECT", "CLIENT", "DURATION", "TAG"])
    .optional()
    .default("DATE")
    .describe("Column to sort results by (default: DATE)"),
  sortOrder: z
    .enum(["ASCENDING", "DESCENDING"])
    .optional()
    .default("ASCENDING")
    .describe("Sort order (default: ASCENDING)"),
  autoPaginate: z
    .boolean()
    .optional()
    .default(false)
    .describe("When true, automatically fetches all pages and concatenates results"),
});

export type TDetailedReportSchema = z.infer<typeof DetailedReportSchema>;
```

- [ ] **Step 2: Create summary report schema**

File: `src/validation/reports/summary-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const SummaryReportSchema = CommonReportFiltersSchema.extend({
  groups: z
    .array(z.enum(["PROJECT", "USER", "CLIENT", "TAG", "DATE", "TIMEENTRY", "MONTH"]))
    .min(1)
    .max(3)
    .describe("Grouping levels for the summary (1-3 levels, e.g. ['PROJECT', 'USER'])"),
  sortColumn: z
    .enum(["GROUP", "DURATION", "AMOUNT"])
    .optional()
    .default("GROUP")
    .describe("Column to sort results by (default: GROUP)"),
});

export type TSummaryReportSchema = z.infer<typeof SummaryReportSchema>;
```

- [ ] **Step 3: Create weekly report schema**

File: `src/validation/reports/weekly-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const WeeklyReportSchema = CommonReportFiltersSchema.extend({});

export type TWeeklyReportSchema = z.infer<typeof WeeklyReportSchema>;
```

- [ ] **Step 4: Create attendance report schema**

File: `src/validation/reports/attendance-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const AttendanceReportSchema = CommonReportFiltersSchema.extend({});

export type TAttendanceReportSchema = z.infer<typeof AttendanceReportSchema>;
```

- [ ] **Step 5: Create expense report schema**

File: `src/validation/reports/expense-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const ExpenseReportSchema = CommonReportFiltersSchema.extend({});

export type TExpenseReportSchema = z.infer<typeof ExpenseReportSchema>;
```

- [ ] **Step 6: Create audit log report schema**

File: `src/validation/reports/audit-log-report-schema.ts`

```typescript
import { z } from "zod";
import { CommonReportFiltersSchema } from "./common-report-filters-schema";

export const AuditLogReportSchema = CommonReportFiltersSchema.extend({});

export type TAuditLogReportSchema = z.infer<typeof AuditLogReportSchema>;
```

- [ ] **Step 7: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/validation/reports/
git commit -m "feat: add report-specific validation schemas"
```

---

### Task 4: Shared Report Validation Schema

**Files:**
- Create: `src/validation/reports/shared-report-schema.ts`

- [ ] **Step 1: Create the shared report schemas**

```typescript
import { z } from "zod";

export const ListSharedReportsSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
});

export const GetSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report"),
});

export const CreateSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  name: z.string().describe("Name for the shared report"),
  reportType: z
    .enum(["DETAILED", "SUMMARY", "WEEKLY"])
    .describe("The type of report"),
  filter: z
    .record(z.any())
    .describe("Report filter configuration — the full report request body to save"),
});

export const UpdateSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report to update"),
  name: z.string().optional().describe("Updated name for the shared report"),
  filter: z
    .record(z.any())
    .optional()
    .describe("Updated report filter configuration"),
});

export const DeleteSharedReportSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace"),
  reportId: z.string().describe("The ID of the shared report to delete"),
});

export type TListSharedReportsSchema = z.infer<typeof ListSharedReportsSchema>;
export type TGetSharedReportSchema = z.infer<typeof GetSharedReportSchema>;
export type TCreateSharedReportSchema = z.infer<typeof CreateSharedReportSchema>;
export type TUpdateSharedReportSchema = z.infer<typeof UpdateSharedReportSchema>;
export type TDeleteSharedReportSchema = z.infer<typeof DeleteSharedReportSchema>;
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/validation/reports/shared-report-schema.ts
git commit -m "feat: add shared report validation schemas"
```

---

### Task 5: Reports SDK Service

**Files:**
- Create: `src/clockify-sdk/reports.ts`

- [ ] **Step 1: Create the reports service with `buildReportRequestBody` helper**

```typescript
import { AxiosInstance } from "axios";
import { reportsApi } from "../config/api";
import { TCommonReportFilters } from "../validation/reports/common-report-filters-schema";

export function buildReportRequestBody(filters: TCommonReportFilters) {
  const { workspaceId, projectIds, clientIds, userIds, tagIds, rawFilters, ...rest } = filters;

  const body: Record<string, any> = {
    dateRangeStart: rest.dateRangeStart,
    dateRangeEnd: rest.dateRangeEnd,
    exportType: "JSON",
  };

  if (projectIds?.length) {
    body.projects = { ids: projectIds, contains: "CONTAINS", status: "ALL" };
  }

  if (clientIds?.length) {
    body.clients = { ids: clientIds, contains: "CONTAINS", status: "ALL" };
  }

  if (userIds?.length) {
    body.users = { ids: userIds, contains: "CONTAINS", status: "ALL" };
  }

  if (tagIds?.length) {
    body.tags = { ids: tagIds, containedInTimeentry: "CONTAINS", status: "ALL" };
  }

  if (rawFilters) {
    Object.assign(body, rawFilters);
  }

  return body;
}

function ReportsService(api: AxiosInstance) {
  async function getDetailedReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/detailed`, body);
  }

  async function getSummaryReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/summary`, body);
  }

  async function getWeeklyReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/weekly`, body);
  }

  async function getAttendanceReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/attendance`, body);
  }

  async function getExpenseReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/expense`, body);
  }

  async function getAuditLogReport(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/audit/report`, body);
  }

  return {
    getDetailedReport,
    getSummaryReport,
    getWeeklyReport,
    getAttendanceReport,
    getExpenseReport,
    getAuditLogReport,
  };
}

export const reportsService = ReportsService(reportsApi);
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/clockify-sdk/reports.ts
git commit -m "feat: add reports SDK service with request body builder"
```

---

### Task 6: Shared Reports SDK Service

**Files:**
- Create: `src/clockify-sdk/shared-reports.ts`

- [ ] **Step 1: Create the shared reports service**

```typescript
import { AxiosInstance } from "axios";
import { reportsApi } from "../config/api";

function SharedReportsService(api: AxiosInstance) {
  async function list(workspaceId: string) {
    return api.get(`workspaces/${workspaceId}/reports/shared`);
  }

  async function get(workspaceId: string, reportId: string) {
    return api.get(`workspaces/${workspaceId}/reports/shared/${reportId}`);
  }

  async function create(workspaceId: string, body: Record<string, any>) {
    return api.post(`workspaces/${workspaceId}/reports/shared`, body);
  }

  async function update(workspaceId: string, reportId: string, body: Record<string, any>) {
    return api.put(`workspaces/${workspaceId}/reports/shared/${reportId}`, body);
  }

  async function remove(workspaceId: string, reportId: string) {
    return api.delete(`workspaces/${workspaceId}/reports/shared/${reportId}`);
  }

  return { list, get, create, update, remove };
}

export const sharedReportsService = SharedReportsService(reportsApi);
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/clockify-sdk/shared-reports.ts
git commit -m "feat: add shared reports SDK service"
```

---

### Task 7: Report Tool Definitions

**Files:**
- Create: `src/tools/reports.ts`

- [ ] **Step 1: Create the 6 report tool definitions**

```typescript
import { z } from "zod";
import { TOOLS_CONFIG } from "../config/api";
import { reportsService, buildReportRequestBody } from "../clockify-sdk/reports";
import { McpResponse, McpToolConfig } from "../types";
import { TDetailedReportSchema } from "../validation/reports/detailed-report-schema";
import { TSummaryReportSchema } from "../validation/reports/summary-report-schema";
import { TCommonReportFilters } from "../validation/reports/common-report-filters-schema";

// Reusable common filter parameters for tool definitions
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

        while (true) {
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
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/tools/reports.ts
git commit -m "feat: add 6 report tool definitions"
```

---

### Task 8: Shared Report Tool Definitions

**Files:**
- Create: `src/tools/shared-reports.ts`

- [ ] **Step 1: Create the 5 shared report tool definitions**

```typescript
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
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/tools/shared-reports.ts
git commit -m "feat: add 5 shared report tool definitions"
```

---

### Task 9: Register Tools in index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add imports for report tools and reportsApi**

Add after the existing tool imports (around line 16):

```typescript
import { reportsApi } from "./config/api";
import {
  getDetailedReportTool,
  getSummaryReportTool,
  getWeeklyReportTool,
  getAttendanceReportTool,
  getExpenseReportTool,
  getAuditLogReportTool,
} from "./tools/reports";
import {
  listSharedReportsTool,
  getSharedReportTool,
  createSharedReportTool,
  updateSharedReportTool,
  deleteSharedReportTool,
} from "./tools/shared-reports";
```

- [ ] **Step 2: Apply auth to reportsApi in `createStatelessServer`**

Add after `api.defaults.headers.Authorization = ...` (line 31):

```typescript
reportsApi.defaults.headers.Authorization = `Bearer ${config.clockifyApiToken}`;
```

- [ ] **Step 3: Register all 11 new tools**

Add after the `listTasksTool` registration (before `return server.server;`):

```typescript
server.tool(
  getDetailedReportTool.name,
  getDetailedReportTool.description,
  getDetailedReportTool.parameters,
  getDetailedReportTool.handler
);

server.tool(
  getSummaryReportTool.name,
  getSummaryReportTool.description,
  getSummaryReportTool.parameters,
  getSummaryReportTool.handler
);

server.tool(
  getWeeklyReportTool.name,
  getWeeklyReportTool.description,
  getWeeklyReportTool.parameters,
  getWeeklyReportTool.handler
);

server.tool(
  getAttendanceReportTool.name,
  getAttendanceReportTool.description,
  getAttendanceReportTool.parameters,
  getAttendanceReportTool.handler
);

server.tool(
  getExpenseReportTool.name,
  getExpenseReportTool.description,
  getExpenseReportTool.parameters,
  getExpenseReportTool.handler
);

server.tool(
  getAuditLogReportTool.name,
  getAuditLogReportTool.description,
  getAuditLogReportTool.parameters,
  getAuditLogReportTool.handler
);

server.tool(
  listSharedReportsTool.name,
  listSharedReportsTool.description,
  listSharedReportsTool.parameters,
  listSharedReportsTool.handler
);

server.tool(
  getSharedReportTool.name,
  getSharedReportTool.description,
  getSharedReportTool.parameters,
  getSharedReportTool.handler
);

server.tool(
  createSharedReportTool.name,
  createSharedReportTool.description,
  createSharedReportTool.parameters,
  createSharedReportTool.handler
);

server.tool(
  updateSharedReportTool.name,
  updateSharedReportTool.description,
  updateSharedReportTool.parameters,
  updateSharedReportTool.handler
);

server.tool(
  deleteSharedReportTool.name,
  deleteSharedReportTool.description,
  deleteSharedReportTool.parameters,
  deleteSharedReportTool.handler
);
```

- [ ] **Step 4: Verify the build still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: register 11 report tools in MCP server"
```

---

### Task 10: npm Publishing Setup

**Files:**
- Modify: `package.json`
- Modify: `src/index.ts`

- [ ] **Step 1: Add shebang to `src/index.ts`**

Add as the very first line of `src/index.ts` (before `import dotenv`):

```typescript
#!/usr/bin/env node
```

- [ ] **Step 2: Update `package.json`**

Change `name` from `"clockify-mcp-server"` to `"@pdubz/clockify-mcp"`.

Add `bin` field:

```json
"bin": {
  "clockify-mcp": "./dist/index.js"
},
```

Bump `version` to `"2.0.0"` (breaking: new package name, new features).

- [ ] **Step 3: Verify the build produces a working dist**

Run: `npm run build`
Expected: Build succeeds, `dist/index.js` exists

- [ ] **Step 4: Verify the shebang is preserved in the build output**

Run: `head -1 dist/index.js`
Expected: Output starts with `#!/usr/bin/env node` (if Smithery preserves it — if not, we'll add a postbuild script)

- [ ] **Step 5: Commit**

```bash
git add package.json src/index.ts
git commit -m "feat: configure npm publishing as @pdubz/clockify-mcp with npx support"
```

---

### Task 11: Tests for `buildReportRequestBody`

**Files:**
- Create: `test/reports.test.ts`

- [ ] **Step 1: Write tests for the request body builder**

```typescript
import { describe, it } from "node:test";
import assert from "node:assert";
import { buildReportRequestBody } from "../src/clockify-sdk/reports";

describe("buildReportRequestBody", () => {
  it("builds body with required fields only", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
    });

    assert.strictEqual(body.dateRangeStart, "2024-01-01T00:00:00.000Z");
    assert.strictEqual(body.dateRangeEnd, "2024-12-31T23:59:59.000Z");
    assert.strictEqual(body.exportType, "JSON");
    assert.strictEqual(body.projects, undefined);
    assert.strictEqual(body.clients, undefined);
    assert.strictEqual(body.users, undefined);
    assert.strictEqual(body.tags, undefined);
  });

  it("maps projectIds into nested project filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: ["p1", "p2"],
    });

    assert.deepStrictEqual(body.projects, {
      ids: ["p1", "p2"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps clientIds into nested client filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      clientIds: ["c1"],
    });

    assert.deepStrictEqual(body.clients, {
      ids: ["c1"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps userIds into nested user filter", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      userIds: ["u1", "u2"],
    });

    assert.deepStrictEqual(body.users, {
      ids: ["u1", "u2"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("maps tagIds into nested tag filter with containedInTimeentry", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      tagIds: ["t1"],
    });

    assert.deepStrictEqual(body.tags, {
      ids: ["t1"],
      containedInTimeentry: "CONTAINS",
      status: "ALL",
    });
  });

  it("does not include workspaceId in the body", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
    });

    assert.strictEqual(body.workspaceId, undefined);
  });

  it("rawFilters override constructed fields", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: ["p1"],
      rawFilters: {
        projects: { ids: ["p_override"], contains: "DOES_NOT_CONTAIN", status: "ACTIVE" },
        approvalState: "APPROVED",
      },
    });

    assert.deepStrictEqual(body.projects, {
      ids: ["p_override"],
      contains: "DOES_NOT_CONTAIN",
      status: "ACTIVE",
    });
    assert.strictEqual(body.approvalState, "APPROVED");
  });

  it("skips empty filter arrays", () => {
    const body = buildReportRequestBody({
      workspaceId: "ws1",
      dateRangeStart: "2024-01-01T00:00:00.000Z",
      dateRangeEnd: "2024-12-31T23:59:59.000Z",
      projectIds: [],
      clientIds: [],
    });

    assert.strictEqual(body.projects, undefined);
    assert.strictEqual(body.clients, undefined);
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npx tsx --test test/reports.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add test/reports.test.ts
git commit -m "test: add unit tests for buildReportRequestBody"
```

---

### Task 12: Integration Tests for Shared Reports

**Files:**
- Create: `test/shared-reports.test.ts`

- [ ] **Step 1: Write integration tests for shared reports CRUD**

```typescript
import { after, describe, it } from "node:test";
import { createMcpClient, TEST_WORKSPACE_ID } from "./setup";
import { McpResponse } from "../src/types";
import assert from "node:assert";

let createdReportId: string;

describe("Shared Reports MCP Tests", async () => {
  const client = await createMcpClient();

  after(async () => {
    await client.close();
  });

  it("List shared reports", async () => {
    const response = (await client.callTool({
      name: "list-shared-reports",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
      },
    })) as McpResponse;

    assert(response.content[0].type === "text");
    const data = JSON.parse(response.content[0].text as string);
    assert(Array.isArray(data));
  });

  it("Create a shared report", async () => {
    const response = (await client.callTool({
      name: "create-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        name: "MCP Test Shared Report",
        reportType: "SUMMARY",
        filter: {
          dateRangeStart: "2024-01-01T00:00:00.000Z",
          dateRangeEnd: "2024-12-31T23:59:59.000Z",
          summaryFilter: {
            groups: ["PROJECT"],
          },
        },
      },
    })) as McpResponse;

    assert((response.content[0].text as string).startsWith("Shared report created successfully"));

    const match = (response.content[0].text as string).match(/ID: ([^\s]+)/);
    if (match) {
      createdReportId = match[1];
    }
  });

  it("Get a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "get-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
      },
    })) as McpResponse;

    assert(response.content[0].type === "text");
    const data = JSON.parse(response.content[0].text as string);
    assert.strictEqual(data.id, createdReportId);
  });

  it("Update a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "update-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
        name: "MCP Test Shared Report Updated",
      },
    })) as McpResponse;

    assert((response.content[0].text as string).startsWith("Shared report updated successfully"));
  });

  it("Delete a shared report", async () => {
    if (!createdReportId) {
      throw new Error("No report ID available");
    }

    const response = (await client.callTool({
      name: "delete-shared-report",
      arguments: {
        workspaceId: TEST_WORKSPACE_ID,
        reportId: createdReportId,
      },
    })) as McpResponse;

    assert((response.content[0].text as string).includes("deleted successfully"));
  });
});
```

- [ ] **Step 2: Run the tests (requires CLOCKIFY_API_TOKEN and TEST_WORKSPACE_ID env vars)**

Run: `npx tsx --test test/shared-reports.test.ts`
Expected: All tests pass (if API token is configured)

- [ ] **Step 3: Commit**

```bash
git add test/shared-reports.test.ts
git commit -m "test: add integration tests for shared reports CRUD"
```

---

### Task 13: Final Build Verification & README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Build the project**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 2: Verify all tools are registered by checking the build output**

Run: `grep -c "server.tool" src/index.ts`
Expected: 21 (10 existing + 11 new)

- [ ] **Step 3: Update README.md with reporting tools documentation**

Add a section documenting the new report tools, their parameters, and usage examples. Include the npx installation instructions:

```markdown
## Installation

### npx (recommended)

Add to your MCP client config:

```json
{
  "mcpServers": {
    "clockify": {
      "command": "npx",
      "args": ["@pdubz/clockify-mcp"],
      "env": {
        "CLOCKIFY_API_TOKEN": "your-api-token"
      }
    }
  }
}
```
```

Document each new tool with its parameters and a brief description.

- [ ] **Step 4: Run all tests**

Run: `npx tsx --test test/reports.test.ts`
Expected: Unit tests pass

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README with reporting tools and npx installation"
```
