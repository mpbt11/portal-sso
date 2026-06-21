const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface BackendProfile {
  ok: boolean;
  status: number;
  data?: unknown;
}

export async function fetchBackendProfile(
  accessToken?: string,
): Promise<BackendProfile> {
  if (!accessToken) {
    return { ok: false, status: 0 };
  }

  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? await res.json() : undefined,
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function adminRequest(
  accessToken: string | undefined,
  path: string,
  init: RequestInit = {},
): Promise<BackendProfile> {
  if (!accessToken) return { ok: false, status: 401 };
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    return {
      ok: res.ok,
      status: res.status,
      data: await res.json().catch(() => undefined),
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export function adminAddUserToGroup(
  accessToken: string | undefined,
  email: string,
  group: string,
) {
  return adminRequest(accessToken, "/auth/admin/groups/add-user", {
    method: "POST",
    body: JSON.stringify({ email, group }),
  });
}

export function adminRemoveUserFromGroup(
  accessToken: string | undefined,
  email: string,
  group: string,
) {
  return adminRequest(accessToken, "/auth/admin/groups/remove-user", {
    method: "POST",
    body: JSON.stringify({ email, group }),
  });
}

export function adminListUsersInGroup(
  accessToken: string | undefined,
  group: string,
) {
  return adminRequest(
    accessToken,
    `/auth/admin/groups/${encodeURIComponent(group)}/users`,
  );
}

export function adminCreateUser(
  accessToken: string | undefined,
  data: { name: string; email: string; group?: string },
) {
  return adminRequest(accessToken, "/auth/admin/create-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
