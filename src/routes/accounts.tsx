import { createFileRoute } from "@tanstack/react-router";
import { checkAuthCached, masto } from "../lib/client";
import { z } from "zod";

const searchSchema = z.object({
  type: z.enum(["local", "remote"]).optional().default("remote"),
  suspended: z.boolean().optional().default(false),
  maxId: z.string().optional(),
});

export const Route = createFileRoute("/accounts")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    type: search.type,
    suspended: search.suspended,
    maxId: search.maxId,
  }),
  loader: async ({ deps: { type, suspended, maxId }, navigate }) => {
    if (!(await checkAuthCached())) {
      navigate({
        to: "/",
      });
    }

    const accounts = masto().v1.admin.accounts.list({
      remote: type === "remote" || undefined,
      suspended: suspended === true || undefined,
      maxId: maxId,
    });

    return {
      accounts: await accounts,
    };
  },
});
