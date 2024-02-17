import {
  createLazyFileRoute,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
import { Avatar, Button } from "flowbite-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { masto } from "../../lib/client";

export const Route = createLazyFileRoute("/accounts/$accountId")({
  component: Account,
});

function Account() {
  const { account } = useLoaderData({
    from: "/accounts/$accountId",
  });
  const { invalidate } = useRouter();
  const query = useQuery({
    queryFn: async () => {
      const statuses = await masto.v1.accounts
        .$select(account.id)
        .statuses.list({
          excludeReplies: false,
        });

      return statuses;
    },
    queryKey: ["statuses", account.id],
  });
  const { mutate, isPending, isSuccess } = useMutation({
    mutationKey: ["suspend", account.id],
    mutationFn: async () => {
      const report = await masto.v1.reports.create({
        accountId: account.id,
        category: "spam",
        forward: true,
        comment: "This account is spam. Please suspend them.",
      });

      await masto.v1.admin.accounts.$select(account.id).action.create({
        type: "suspend",
        reportId: report.id,
        sendEmailNotification: true,
        text: "This account has been suspended for spam.",
      });

      invalidate();
    },
  });

  return (
    <div className="p-8">
      <div className="flex flex-row items-center gap-4">
        <Avatar size="lg" img={account.account.avatar} />
        <div>
          <h1 className="text-2xl">{account.account.displayName}</h1>
          <h2 className="text-xl">
            @{account.username}@{account.domain}
          </h2>
        </div>
      </div>
      <div>
        <p>Followers: {account.account.followersCount}</p>
        <p>Following: {account.account.followingCount}</p>
        <p>Created at: {account.account.createdAt}</p>
        <p>Bio: {JSON.stringify(account.account.fields)}</p>
      </div>
      {account.suspended}
      <Button
        className="mt-4"
        color={account.suspended || isSuccess ? "primary" : "failure"}
        onClick={() => mutate()}
        disabled={isPending || account.suspended || isSuccess}
      >
        {account.suspended || isSuccess ? "Suspended!" : "Suspend Spam"}
      </Button>
      {query.data && (
        <>
          <h2 className="text-xl">Posts</h2>
          {query.data?.map((x) => {
            return (
              <div className="border border-gray-100 shadow-lg my-4 rounded-lg p-4">
                <div dangerouslySetInnerHTML={{ __html: x.content }} />
                {x.mediaAttachments.map(
                  (x) => x.type === "image" && x.url && <img src={x.url} />
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
