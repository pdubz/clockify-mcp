import { TOOLS_CONFIG } from "../config/api.js";
import { usersService } from "../clockify-sdk/users.js";
import {
  ClockifyUser,
  McpResponse,
  McpToolConfigWithoutParameters,
} from "../types/index.js";

export const getCurrentUserTool: McpToolConfigWithoutParameters = {
  name: TOOLS_CONFIG.users.current.name,
  description: TOOLS_CONFIG.users.current.description,
  handler: async (): Promise<McpResponse> => {
    const response = await usersService.getCurrent();

    const user: ClockifyUser = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(user),
        },
      ],
    };
  },
};
