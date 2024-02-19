import {
  createLazyFileRoute,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
import { Avatar, Button } from "flowbite-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { masto, serverUrl } from "../../lib/client";
import { mastodon } from "masto";
import { useAccountStatuses } from "../../queries/useAccountStatuses";

export const Route = createLazyFileRoute("/accounts/$accountId")({
  component: Account,
});

function Account() {
  const { account } = useLoaderData({
    from: "/accounts/$accountId",
  });

  return (
    <div className="p-8">
      <div className="flex flex-row items-center gap-4">
        <Avatar size="lg" img={account.account.avatar} />
        <AccountHeader account={account} />
      </div>
      <AccountDetails account={account} />
      <SuspendButton />
      {account.domain && <LimitDomainButton domain={account.domain} />}
      <Posts />
    </div>
  );
}

interface AccountHeaderProps {
  account: mastodon.v1.Admin.Account;
}

const AccountHeader = ({ account }: AccountHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl">{account.account.displayName}</h1>
      <h2 className="text-xl">
        @{account.username}@{account.domain}
      </h2>
    </div>
  );
};

interface AccountDetailsProps {
  account: mastodon.v1.Admin.Account;
}

const AccountDetails = ({ account }: AccountDetailsProps) => {
  return (
    <div>
      <p>Followers: {account.account.followersCount}</p>
      <p>Following: {account.account.followingCount}</p>
      <p>Created at: {account.account.createdAt}</p>
      <p>Bio: {JSON.stringify(account.account.fields)}</p>
    </div>
  );
};

const Posts = () => {
  const { account } = useLoaderData({
    from: "/accounts/$accountId",
  });
  const query = useAccountStatuses(account);

  return (
    <div>
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
    </div>
  );
};

const SuspendButton = () => {
  const { account } = useLoaderData({
    from: "/accounts/$accountId",
  });
  const statusQuery = useAccountStatuses(account);
  const { invalidate } = useRouter();
  const mutation = useMutation({
    mutationKey: ["suspend", account.id],
    mutationFn: async () => {
      const report = await masto().v1.reports.create({
        accountId: account.id,
        category: "spam",
        forward: true,
        comment: "This account is spam. Please suspend them.",
        statusIds:
          statusQuery.data && statusQuery.data?.length > 0
            ? [statusQuery.data[0].id]
            : [],
      });

      await masto().v1.admin.accounts.$select(account.id).action.create({
        type: "suspend",
        reportId: report.id,
        sendEmailNotification: true,
        text: "This account has been suspended for spam.",
      });

      invalidate();
    },
  });

  return (
    <Button
      color={account.suspended || mutation.isSuccess ? "primary" : "failure"}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || account.suspended || mutation.isSuccess}
    >
      {account.suspended || mutation.isSuccess ? "Suspended!" : "Suspend Spam"}
    </Button>
  );
};

interface LimitDomainButtonProps {
  domain: string;
}

const LimitDomainButton = (props: LimitDomainButtonProps) => {
  const currentDomainBlocks = useQuery({
    queryKey: ["currentBlocks"],
    queryFn: async () => {
      try {
        // Use admin API first, if that doesn't work, try the public one, if that doesn't work, return an empty array and pray.
        const blockIterator = masto()
          .v1.admin.domainBlocks.list({
            limit: 200,
          })
          .values();
        let blocks: Array<mastodon.v1.Admin.DomainBlock> = [];
        for await (const blockList of blockIterator) {
          blocks = blocks.concat(blockList);
        }

        return blocks;
      } catch (e) {
        console.error(e);
        try {
          return (await (
            await fetch(`${serverUrl()}/api/v1/instance/domain_blocks`)
          ).json()) as Array<mastodon.v1.Admin.DomainBlock>;
        } catch (e) {
          return [] as Array<mastodon.v1.Admin.DomainBlock>;
        }
      }
    },
  });
  const queryClient = useQueryClient();

  const isBlockedDomain: boolean | null =
    currentDomainBlocks.data !== undefined
      ? currentDomainBlocks.data.some((x) => x.domain === props.domain)
      : null;

  const domainBlockMutation = useMutation({
    mutationFn: async () => {
      if (isBlockedDomain === false) {
        await masto().v1.admin.domainBlocks.create({
          domain: props.domain,
          publicComment: "Limited because of spam.",
          severity: "silence",
        });
        queryClient.setQueryData(
          ["currentBlocks"],
          (
            old: Array<mastodon.v1.Admin.DomainBlock>
          ): Array<mastodon.v1.Admin.DomainBlock> => [
            ...old,
            {
              domain: props.domain,
              publicComment: "Limited because of spam.",
              severity: "silence",
              createdAt: new Date().toISOString(),
              obfuscate: false,
              rejectMedia: false,
              id: "ooop",
              rejectReposts: false,
            },
          ]
        );
      }
    },
  });

  return (
    <Button
      onClick={() => domainBlockMutation.mutate()}
      disabled={
        isBlockedDomain === true ||
        currentDomainBlocks.isPending ||
        domainBlockMutation.isPending
      }
    >
      {isBlockedDomain === true
        ? "Domain limited!"
        : isBlockedDomain === null
          ? "Loading..."
          : "Limit Domain"}
    </Button>
  );
};
