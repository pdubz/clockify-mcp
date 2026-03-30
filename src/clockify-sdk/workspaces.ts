import { AxiosInstance } from "axios";
import { api } from "../config/api.js";

function WorkspacesService(api: AxiosInstance) {
  async function fetchAll() {
    return api.get(`workspaces`);
  }

  return { fetchAll };
}

export const workspacesService = WorkspacesService(api);
