import { createFileRoute } from "@tanstack/react-router";
import { checkAuthCached } from "../lib/client";

export const Route = createFileRoute("/")({
  loader: async ({ navigate }) => {
    if (await checkAuthCached()) {
      navigate({
        to: "/accounts",
        search: { suspended: false, type: "remote" },
      });
    }
  },
});
