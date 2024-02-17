import { createRestAPIClient } from "masto";

export const scopes = "read write:reports admin:read admin:write";

export const masto = () =>
  createRestAPIClient({
    url: "https://urbanists.social",
    accessToken: localStorage.getItem("accessToken")!,
  });
