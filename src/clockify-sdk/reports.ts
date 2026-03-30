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
