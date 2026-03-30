import { TOOLS_CONFIG } from "../config/api.js";
import { workspacesService } from "../clockify-sdk/workspaces.js";
import {
  ClockifyWorkspace,
  McpResponse,
  McpToolConfigWithoutParameters,
} from "../types/index.js";

export const findWorkspacesTool: McpToolConfigWithoutParameters = {
  name: TOOLS_CONFIG.workspaces.list.name,
  description: TOOLS_CONFIG.workspaces.list.description,
  handler: async (): Promise<McpResponse> => {
    const response = await workspacesService.fetchAll();

    const workspaces = response.data.map((workspace: ClockifyWorkspace) => ({
      name: workspace.name,
      id: workspace.id,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(workspaces),
        },
      ],
    };
  },
};
