// src/lib/drive/authUtils.ts

import { getGoogleAuthClient } from "../googleAuth";

export async function getAuthToken() {
  const auth = await getGoogleAuthClient();
  return `Bearer ${(await auth.getAccessToken()).token}`;
}
