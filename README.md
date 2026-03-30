# @pdubz/clockify-mcp

A Model Context Protocol (MCP) server for Clockify — manage time entries, projects, tags, and generate reports through any MCP-compatible AI client.

## Installation

### npx (recommended)

Add to your MCP client config (Claude Desktop, Claude Code, Cursor, etc.):

```json
{
  "mcpServers": {
    "clockify": {
      "command": "npx",
      "args": ["@pdubz/clockify-mcp", "--local"],
      "env": {
        "CLOCKIFY_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### From source

```bash
git clone https://github.com/pdubz/clockify-mcp.git
cd clockify-mcp
npm install && npm run build
```

Then add to your MCP client config:

```json
{
  "mcpServers": {
    "clockify": {
      "command": "node",
      "args": ["ABSOLUTE_PATH/dist/index.js"],
      "env": {
        "CLOCKIFY_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Tools

### Time Management

| Tool | Description |
|------|-------------|
| `get-workspaces` | List available workspaces |
| `get-current-user` | Get the authenticated user |
| `get-projects` | List projects in a workspace |
| `get-tags` | List tags in a workspace |
| `create-tag` | Create a new tag |
| `list-tasks` | List tasks within a project |
| `create-time-entry` | Create a new time entry |
| `list-time-entries` | List time entries for a user |
| `edit-time-entry` | Update an existing time entry |
| `delete-time-entry` | Delete a time entry |

### Reports

| Tool | Description |
|------|-------------|
| `get-detailed-report` | Individual time entries with full detail. Supports pagination and auto-pagination. |
| `get-summary-report` | Aggregated data grouped by project, user, client, tag, date, or month (1-3 grouping levels). |
| `get-weekly-report` | Time data organized by day of the week. |
| `get-attendance-report` | Work hours and break time tracking. |
| `get-expense-report` | Expense data for a workspace. |
| `get-audit-log-report` | Workspace activity history. |

All report tools accept common filter parameters:
- `workspaceId` (required) — workspace ID
- `dateRangeStart` / `dateRangeEnd` (required) — ISO 8601 date strings
- `projectIds`, `clientIds`, `userIds`, `tagIds` (optional) — filter by IDs
- `rawFilters` (optional) — advanced filters merged into the request body for custom filtering

### Shared Reports

| Tool | Description |
|------|-------------|
| `list-shared-reports` | List saved reports in a workspace |
| `get-shared-report` | Get a specific saved report |
| `create-shared-report` | Save a new report configuration |
| `update-shared-report` | Update a saved report |
| `delete-shared-report` | Delete a saved report |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOCKIFY_API_TOKEN` | Yes | Your Clockify API token |
| `CLOCKIFY_API_URL` | No | Override core API URL (default: `https://api.clockify.me/api/v1`) |
| `CLOCKIFY_REPORTS_API_URL` | No | Override reports API URL (default: `https://reports.api.clockify.me/v1`) |

## Development

```bash
npm install
npm run dev     # Start dev server with tsx
npm run build   # Build for production
npx tsx --test test/reports.test.ts  # Run unit tests
```

## License

MIT License

Copyright (c) 2026 pdubz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
