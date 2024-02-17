import { mastodon } from "masto";
import { Avatar } from "flowbite-react";
import { Link, useSearch } from "@tanstack/react-router";

type AccountItemProps = {
  account: mastodon.v1.Admin.Account;
};

const AccountItem: React.FC<AccountItemProps> = ({ account }) => {
  const search = useSearch({
    from: "/accounts",
  });

  // Your component logic here
  return (
    <Link
      to={"/accounts/$accountId"}
      search={{
        ...search,
      }}
      params={{ accountId: account.id }}
      activeProps={{
        className: "bg-purple-500 text-white",
      }}
      className="flex flex-row gap-2 items-center py-4 px-2 border-b border-gray-100 first:border-t"
    >
      <Avatar img={account.account.avatarStatic} />
      <p>
        @{account.username}@{account.domain}
      </p>
    </Link>
  );
};

export default AccountItem;
