import {
  createLazyFileRoute,
  useLoaderData,
  Outlet,
  Link,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import AccountItem from "../components/AccountItem";

export const Route = createLazyFileRoute("/accounts")({
  component: Accounts,
});

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
        <Link
          search={{
            ...search,
            maxId: data.accounts.map((x) => x.id).sort()[0],
          }}
          className="w-full block py-8 bg-purple-500 text-white my-4"
          params={{ ...otherParams }}
        >
          Next Page
        </Link>
      </div>
      <div className="w-3/4 overflow-scroll">
        <Outlet />
      </div>
    </div>
  );
}
