import { createRestAPIClient } from "masto";

export const scopes = "read write:reports admin:read admin:write";

export function cleanupAuth() {
  localStorage.clear();
}

export function checkScopes() {
  if (localStorage.getItem("scopes") !== scopes) {
    cleanupAuth();
    return false;
  }
  return true;
}

export async function checkAuth() {
  if (localStorage.getItem("accessToken") === null) {
    cleanupAuth();
    return false;
  }

  if (!checkScopes()) {
    return false;
  }

  try {
    const client = masto();
    await client.v1.apps.verifyCredentials();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

let authStatus: null | boolean = null;

export async function checkAuthCached() {
  if (authStatus !== null) {
    return authStatus;
  }

  authStatus = await checkAuth();
  return authStatus;
}

export const masto = () =>
  createRestAPIClient({
    url: "https://urbanists.social",
    accessToken: localStorage.getItem("accessToken")!,
  });
