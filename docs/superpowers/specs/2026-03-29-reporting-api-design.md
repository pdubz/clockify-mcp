# Clockify Reporting API Integration — Design Spec

## Overview

Expand the clockify-mcp server to support Clockify's Reporting API, adding 11 new MCP tools (6 report types + 5 shared report CRUD). Rename and publish the package as `@pdubz/clockify-mcp` for npx usage.

## Decisions

- **All 6 report types:** detailed, summary, weekly, attendance, expense, audit log
- **Shared reports full CRUD:** list, get, create, update, delete
- **JSON only:** no export format parameter; the agent handles format conversion
- **Full grouping flexibility:** summary report exposes a `groups` array (`PROJECT`, `USER`, `CLIENT`, `TAG`, `DATE`, `TIMEENTRY`, `MONTH`)
- **Common filters + rawFilters escape hatch:** named params for common filters, freeform object for advanced use
- **Agent-controlled pagination with auto-paginate override:** `page`/`pageSize` params plus `autoPaginate` boolean
- **Env var auth:** `CLOCKIFY_API_TOKEN` passed via MCP client config; OAuth deferred to future work
- **Separate Axios instance:** new `reportsApi` client for `reports.api.clockify.me/v1`

## Architecture

### Reports API Client

New Axios instance in `src/config/api.ts`:

```typescript
export const reportsApi = axios.create({
  baseURL: process.env.CLOCKIFY_REPORTS_API_URL || 'https://reports.api.clockify.me/v1',
  headers: {
    "X-Api-Key": `${process.env.CLOCKIFY_API_TOKEN}`,
  },
});
```

Same auth header as the existing `api` instance. The `index.ts` Smithery init applies bearer token setup to both instances.

### SDK Services

**`src/clockify-sdk/reports.ts`**

Factory function using `reportsApi`. Methods:

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getDetailedReport(workspaceId, body)` | POST | `/workspaces/{id}/reports/detailed` |
| `getSummaryReport(workspaceId, body)` | POST | `/workspaces/{id}/reports/summary` |
| `getWeeklyReport(workspaceId, body)` | POST | `/workspaces/{id}/reports/weekly` |
| `getAttendanceReport(workspaceId, body)` | POST | `/workspaces/{id}/reports/attendance` |
| `getExpenseReport(workspaceId, body)` | POST | `/workspaces/{id}/reports/expense` |
| `getAuditLogReport(workspaceId, body)` | POST | `/workspaces/{id}/audit/report` |

Includes a `buildReportRequestBody` helper that maps flat tool params into Clockify's nested filter format:

```typescript
// Input (flat, agent-friendly)
{ projectIds: ["abc"], clientIds: ["def"], tagIds: ["ghi"] }

// Output (Clockify API format)
{
  projects: { ids: ["abc"], contains: "CONTAINS", status: "ALL" },
  clients: { ids: ["def"], contains: "CONTAINS", status: "ALL" },
  tags: { ids: ["ghi"], containedInTimeentry: "CONTAINS", status: "ALL" }
}
```

The `rawFilters` object is spread last, allowing override of any constructed field.

**`src/clockify-sdk/shared-reports.ts`**

Factory function using `reportsApi`. Methods:

| Method | HTTP | Endpoint |
|--------|------|----------|
| `list(workspaceId)` | GET | `/workspaces/{id}/reports/shared` |
| `get(workspaceId, reportId)` | GET | `/workspaces/{id}/reports/shared/{reportId}` |
| `create(workspaceId, body)` | POST | `/workspaces/{id}/reports/shared` |
| `update(workspaceId, reportId, body)` | PUT | `/workspaces/{id}/reports/shared/{reportId}` |
| `remove(workspaceId, reportId)` | DELETE | `/workspaces/{id}/reports/shared/{reportId}` |

### Tool Definitions

**`src/tools/reports.ts`** — 6 tools:

| Tool | Report-Specific Parameters |
|------|---------------------------|
| `get-detailed-report` | `page`, `pageSize`, `sortColumn` (`DATE`), `autoPaginate` |
| `get-summary-report` | `groups` (string array), `sortColumn` |
| `get-weekly-report` | (common filters only) |
| `get-attendance-report` | (common filters only) |
| `get-expense-report` | (common filters only) |
| `get-audit-log-report` | (common filters + `rawFilters` only) |

**Common parameters** shared across all report tools:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | yes | Workspace ID |
| `dateRangeStart` | string | yes | ISO datetime start |
| `dateRangeEnd` | string | yes | ISO datetime end |
| `projectIds` | string[] | no | Filter by project IDs |
| `clientIds` | string[] | no | Filter by client IDs |
| `userIds` | string[] | no | Filter by user IDs |
| `tagIds` | string[] | no | Filter by tag IDs |
| `rawFilters` | object | no | Merged into request body for advanced filtering |

**`src/tools/shared-reports.ts`** — 5 tools:

| Tool | Parameters |
|------|-----------|
| `list-shared-reports` | `workspaceId` |
| `get-shared-report` | `workspaceId`, `reportId` |
| `create-shared-report` | `workspaceId`, `name`, `reportType`, filter/grouping config (schema derived from Clockify API during implementation) |
| `update-shared-report` | `workspaceId`, `reportId`, `name` (optional), updated filter/grouping config (same schema as create) |
| `delete-shared-report` | `workspaceId`, `reportId` |

### Validation Schemas

Located in `src/validation/reports/`:

- `common-report-filters-schema.ts` — shared Zod schema for common filter fields, reused by all report schemas
- `detailed-report-schema.ts` — extends common with `page`, `pageSize`, `sortColumn`, `autoPaginate`
- `summary-report-schema.ts` — extends common with `groups` array, `sortColumn`
- `weekly-report-schema.ts` — extends common (no extra fields)
- `attendance-report-schema.ts` — extends common
- `expense-report-schema.ts` — extends common
- `audit-log-report-schema.ts` — extends common
- `shared-report-schema.ts` — schemas for CRUD operations

### Pagination

Detailed reports support body-level pagination via `detailedFilter.page` and `detailedFilter.pageSize`.

- Default: `page: 1`, `pageSize: 1000`
- Optional `autoPaginate: true` — handler fetches all pages using the `Last-Page` response header, concatenating results before returning
- When `autoPaginate` is false (default), the response indicates whether more pages exist

### Request Body Construction

The `buildReportRequestBody` helper:

1. Takes flat tool params (dates, filter IDs, rawFilters)
2. Constructs the nested Clockify filter format (projects/clients/tags objects with `ids`, `contains`, `status`)
3. Adds `dateRangeStart`, `dateRangeEnd`, `sortOrder`, `exportType: "JSON"`
4. Spreads `rawFilters` last for override capability
5. Returns the complete request body; each tool handler adds report-specific fields (e.g., `detailedFilter`, `summaryFilter`)

### Error Handling

Follow existing pattern: try/catch in each tool handler, return descriptive error in `McpResponse` with `isError: true`.

## npm Publishing & npx Support

- Rename package to `@pdubz/clockify-mcp` in `package.json`
- Add `"bin": { "clockify-mcp": "./dist/index.js" }`
- Add `#!/usr/bin/env node` shebang to `src/index.ts`
- Publish as scoped package to npm
- Usage: `npx @pdubz/clockify-mcp` with `CLOCKIFY_API_TOKEN` env var

MCP client config example:
```json
{
  "mcpServers": {
    "clockify": {
      "command": "npx",
      "args": ["@pdubz/clockify-mcp"],
      "env": { "CLOCKIFY_API_TOKEN": "your-token" }
    }
  }
}
```

## Testing

- `test/reports.test.ts` — test `buildReportRequestBody` helper, filter mapping, auto-pagination logic, each report type handler
- `test/shared-reports.test.ts` — test CRUD operations
- Mock `reportsApi` Axios responses following existing test patterns

## File Summary

**New files:**
- `src/clockify-sdk/reports.ts`
- `src/clockify-sdk/shared-reports.ts`
- `src/tools/reports.ts`
- `src/tools/shared-reports.ts`
- `src/validation/reports/common-report-filters-schema.ts`
- `src/validation/reports/detailed-report-schema.ts`
- `src/validation/reports/summary-report-schema.ts`
- `src/validation/reports/weekly-report-schema.ts`
- `src/validation/reports/attendance-report-schema.ts`
- `src/validation/reports/expense-report-schema.ts`
- `src/validation/reports/audit-log-report-schema.ts`
- `src/validation/reports/shared-report-schema.ts`
- `test/reports.test.ts`
- `test/shared-reports.test.ts`

**Modified files:**
- `src/config/api.ts` — add `reportsApi` instance, update `TOOLS_CONFIG`
- `src/index.ts` — register 11 new tools, apply auth to `reportsApi`, add shebang
- `package.json` — rename to `@pdubz/clockify-mcp`, add `bin` field
