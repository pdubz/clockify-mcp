#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_CONFIG } from "./config/api.js";
import {
  createEntryTool,
  deleteEntryTool,
  editEntryTool,
  listEntriesTool,
} from "./tools/entries.js";
import { findProjectTool } from "./tools/projects.js";
import { getCurrentUserTool } from "./tools/users.js";
import { findWorkspacesTool } from "./tools/workspaces.js";
import { createTagTool, getTagsTool } from "./tools/tags.js";
import { listTasksTool } from "./tools/tasks.js";
import {
  getDetailedReportTool,
  getSummaryReportTool,
  getWeeklyReportTool,
  getAttendanceReportTool,
  getExpenseReportTool,
  getAuditLogReportTool,
} from "./tools/reports.js";
import {
  listSharedReportsTool,
  getSharedReportTool,
  createSharedReportTool,
  updateSharedReportTool,
  deleteSharedReportTool,
} from "./tools/shared-reports.js";
const server = new McpServer(SERVER_CONFIG);

function registerTools() {
  server.tool(
    createEntryTool.name,
    createEntryTool.description,
    createEntryTool.parameters,
    createEntryTool.handler
  );

  server.tool(
    findProjectTool.name,
    findProjectTool.description,
    findProjectTool.parameters,
    findProjectTool.handler
  );

  server.tool(
    listEntriesTool.name,
    listEntriesTool.description,
    listEntriesTool.parameters,
    listEntriesTool.handler
  );

  server.tool(
    getCurrentUserTool.name,
    getCurrentUserTool.description,
    getCurrentUserTool.handler
  );

  server.tool(
    findWorkspacesTool.name,
    findWorkspacesTool.description,
    findWorkspacesTool.handler
  );

  server.tool(
    deleteEntryTool.name,
    deleteEntryTool.description,
    deleteEntryTool.parameters,
    deleteEntryTool.handler
  );

  server.tool(
    editEntryTool.name,
    editEntryTool.description,
    editEntryTool.parameters,
    editEntryTool.handler
  );

  server.tool(
    getTagsTool.name,
    getTagsTool.description,
    getTagsTool.parameters,
    getTagsTool.handler
  );

  server.tool(
    createTagTool.name,
    createTagTool.description,
    createTagTool.parameters,
    createTagTool.handler
  );

  server.tool(
    listTasksTool.name,
    listTasksTool.description,
    listTasksTool.parameters,
    listTasksTool.handler
  );

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

}

registerTools();
const transport = new StdioServerTransport();
server.connect(transport);
