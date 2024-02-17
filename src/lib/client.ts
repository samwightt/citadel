import { createRestAPIClient } from "masto";

export const masto = createRestAPIClient({
  url: "https://urbanists.social",
  accessToken: localStorage.getItem("accessToken")!,
});
