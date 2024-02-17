import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async ({ navigate }) => {
    if (localStorage.getItem("accessToken") !== null) {
      navigate({
        to: "/accounts",
        search: { suspended: false, type: "remote" },
      });
    }
  },
});
