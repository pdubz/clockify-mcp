import { AxiosInstance } from "axios";
import { api } from "../config/api.js";
import { fetchAllPages } from "../config/pagination.js";

function ProjectsService(api: AxiosInstance) {
  async function fetchAll(workspaceId: string) {
    const params = new URLSearchParams({ archived: "false" });
    const data = await fetchAllPages<any>(
      `workspaces/${workspaceId}/projects`,
      params
    );
    return { data };
  }

  return { fetchAll };
}

export const projectsService = ProjectsService(api);
