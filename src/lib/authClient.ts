import { createRestAPIClient } from "masto";

export function createAuth(domain: string) {
  return createRestAPIClient({
    url: `https://${domain}`,
  });
}
