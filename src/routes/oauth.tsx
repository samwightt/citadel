import { createFileRoute, Link } from "@tanstack/react-router";
import { createRestAPIClient } from "masto";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
});

export const Route = createFileRoute("/oauth")({
  validateSearch: (search) => schema.parse(search),
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ deps: { code }, navigate }) => {
    const serverDomain = localStorage.getItem("serverDomain")!;
    const clientId = localStorage.getItem("clientId")!;
    const clientSecret = localStorage.getItem("clientSecret")!;

    const urlParams = new URLSearchParams();
    urlParams.append("client_id", clientId);
    urlParams.append("client_secret", clientSecret);
    urlParams.append("code", code);
    urlParams.append("grant_type", "authorization_code");
    urlParams.append(
      "redirect_uri",
      `${import.meta.env.VITE_PUBLIC_DOMAIN}/oauth`
    );
    urlParams.append("scope", "read write:reports admin:read admin:write");

    const url = `https://${serverDomain}/oauth/token`;
    const fullUrl = `${url}?${urlParams.toString()}`;
    const result = await fetch(fullUrl, {
      method: "POST",
    });

    const json = await result.json();
    try {
      const authResult = await createRestAPIClient({
        url: `https://${serverDomain}`,
        accessToken: json.access_token,
      }).v1.apps.verifyCredentials();
      console.log(authResult);
      localStorage.setItem("accessToken", json.access_token);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate({
        to: "/accounts",
      });
    } catch (e) {
      return {
        error: "Invalid credentials. Please try again.",
      };
    }
  },
  component: OAuth,
});

function OAuth() {
  return (
    <div>
      Oops! Looks like an error occured. Please go home and try again.
      <Link to="/">Go Home</Link>
    </div>
  );
}
