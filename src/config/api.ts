import axios from "axios";

export const api = axios.create({
  baseURL: process.env.CLOCKIFY_API_URL || 'https://api.clockify.me/api/v1',
  headers: {
    "X-Api-Key": `${process.env.CLOCKIFY_API_TOKEN}`,
  },
});

export const reportsApi = axios.create({
  baseURL: process.env.CLOCKIFY_REPORTS_API_URL || 'https://reports.api.clockify.me/v1',
  headers: {
    "X-Api-Key": `${process.env.CLOCKIFY_API_TOKEN}`,
  },
});

export const SERVER_CONFIG = {
  name: "Clockify MCP Server",
  version: "1.0.0",
  description:
    "A service that integrates with Clockify API to manage time entries",
};

export const TOOLS_CONFIG = {
  workspaces: {
    list: {
      name: "get-workspaces",
      description:
        "Get user available workspaces id and name, a workspace is required to manage time entries",
    },
  },
  projects: {
    list: {
      name: "get-projects",
      description:
        "Get workspace projects id and name, the projects can be associated with time entries",
    },
  },
  users: {
    current: {
      name: "get-current-user",
      description:
        "Get the current user id and name, to search for entries is required to have the user id",
    },
  },
  entries: {
    create: {
      name: "create-time-entry",
      description:
        "Register a new time entry of a task or break in a workspace",
    },
    list: {
      name: "list-time-entries",
      description: "Get registered time entries from a workspace",
    },
    delete: {
      name: "delete-time-entry",
      description: "Delete a specific time entry from a workspace",
    },
    edit: {
      name: "edit-time-entry",
      description: "Edit an existing time entry in a workspace",
    },
  },
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
};
