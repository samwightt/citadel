import { createFileRoute } from "@tanstack/react-router";
import { masto, checkAuthCached } from "../../lib/client";

export const Route = createFileRoute("/accounts/$accountId")({
  loader: async ({ params: { accountId }, navigate }) => {
    if (!(await checkAuthCached())) {
      navigate({
        to: "/",
      });
    }

    const account = masto().v1.admin.accounts.$select(accountId).fetch();
    return {
      account: await account,
    };
  },
});
