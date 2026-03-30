import { AxiosInstance } from "axios";
import { reportsApi } from "../config/api.js";

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
