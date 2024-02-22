import {
  createLazyFileRoute,
  useLoaderData,
  Outlet,
  Link,
  useParams,
  useSearch,
  useLinkProps,
} from "@tanstack/react-router";
import AccountItem from "../components/AccountItem";
import { Button, ButtonProps } from "flowbite-react";

export const Route = createLazyFileRoute("/accounts")({
  component: Accounts,
});

const ButtonLink = (
  props: Parameters<typeof useLinkProps>[0] & ButtonProps
) => {
  const prop = useLinkProps(props);

  return <Button as="a" {...props} {...prop} />;
};

function Accounts() {
  const data = useLoaderData({
    from: "/accounts",
  });
  const otherParams = useParams({
    strict: false,
  });
  const search = useSearch({
    strict: false,
  });

  return (
    <div className="max-h-screen h-screen w-full flex flex-row gap-2">
      <div className="w-1/4 overflow-scroll">
        <div>
          <label>
            Suspended?
            <Link
              params={{ ...otherParams }}
              search={{
                ...search,
                suspended: true,
              }}
              activeProps={{
                className: "font-bold",
              }}
            >
              Yes
            </Link>
            <Link
              params={{ ...otherParams }}
              search={{
                ...search,
                suspended: false,
              }}
              activeProps={{
                className: "font-bold",
              }}
            >
              No
            </Link>
          </label>
          <label>
            Location:{" "}
            <Link
              params={{ ...otherParams }}
              search={{
                ...search,
                type: "local",
              }}
              activeProps={{
                className: "font-bold",
              }}
            >
              Local
            </Link>
            <Link
              params={{ ...otherParams }}
              search={{
                ...search,
                type: "remote",
              }}
              activeProps={{
                className: "font-bold",
              }}
            >
              Remote
            </Link>
          </label>
        </div>
        {data.accounts.map((x) => (
          <div>
            <AccountItem account={x} />
          </div>
        ))}
        <ButtonLink
          search={{
            ...search,
            maxId: data.accounts.map((x) => x.id).sort()[0],
          }}
          params={{ ...otherParams }}
        >
          Next Page
        </ButtonLink>
      </div>
      <div className="w-3/4 overflow-scroll">
        <Outlet />
      </div>
    </div>
  );
}
