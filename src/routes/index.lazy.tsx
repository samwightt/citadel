import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import videoUrl from "../assets/example.mp4";
import { TextInput, Button } from "flowbite-react";
import { createAuth } from "../lib/authClient";
import { scopes } from "../lib/client";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex w-full min-h-screen flex-col justify-center items-center max-w-6xl mx-auto">
      <h1 className="text-4xl">Welcome to Citadel!</h1>
      <p className="mt-4 mb-8">
        Citadel is a suite of tools that makes moderating Mastodon servers
        easier. Right now it makes it very easy to suspend spam accounts and
        send reports their server admins. See the video below for an example.
      </p>
      <video width="500" height="400" controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p>Please enter your server URL below to get started.</p>
      <ServerOauth />
    </div>
  );
}

function ServerOauth() {
  const [text, setText] = useState("");

  return (
    <div className="my-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          console.log(text);
          const auth = createAuth(text);

          localStorage.setItem("serverDomain", text);

          if (
            !localStorage.getItem("clientId") ||
            !localStorage.getItem("clientSecret")
          ) {
            const app = await auth.v1.apps.create({
              clientName: "Citadel",
              scopes: scopes,
              redirectUris: `${import.meta.env.VITE_PUBLIC_DOMAIN}/oauth`,
            });

            // store creds in local storage
            localStorage.setItem("clientId", app.clientId!);
            localStorage.setItem("clientSecret", app.clientSecret!);
          }

          // Store scopes in local storage so we can be sure whether or not they've changed
          localStorage.setItem("scopes", scopes);

          const clientId = localStorage.getItem("clientId")!;

          const redirectUrl = `${import.meta.env.VITE_PUBLIC_DOMAIN}/oauth`;
          const url = `https://${text}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${scopes}`;
          location.assign(url);
        }}
        className="flex flex-row gap-4"
      >
        <TextInput
          type="text"
          placeholder="Server Domain"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit">Sign in</Button>
      </form>
    </div>
  );
}
