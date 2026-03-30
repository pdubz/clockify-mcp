import { AxiosInstance } from "axios";
import { api } from "../config/api.js";

function UsersService(api: AxiosInstance) {
  async function getCurrent() {
    return api.get("user");
  }

  return { getCurrent };
}

export const usersService = UsersService(api);
