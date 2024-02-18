import { mastodon } from "masto";
import { useQuery } from "@tanstack/react-query";
import { masto } from "../lib/client";

export function useAccountStatuses(account: mastodon.v1.Admin.Account) {
  const query = useQuery({
    queryFn: async () => {
      const statuses = await masto()
        .v1.accounts.$select(account.id)
        .statuses.list({
          excludeReplies: false,
        });

      return statuses;
    },
    queryKey: ["statuses", account.id],
  });

  return query;
}
