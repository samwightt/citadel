import { createFileRoute } from "@tanstack/react-router";
import { masto } from "../../lib/client";

export const Route = createFileRoute("/accounts/$accountId")({
  loader: async ({ params: { accountId } }) => {
    const account = masto.v1.admin.accounts.$select(accountId).fetch();
    return {
      account: await account,
    };
  },
});
