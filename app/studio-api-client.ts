export type StudioProfileResponse = {
  displayName: string;
  email: string;
  region: string;
  language: string;
  topics: string[];
  socialUrl: string;
};

export type StudioApplicationResponse = {
  id: string;
  campaignId: string;
  note: string;
  status: "submitted" | "withdrawn";
  submittedAt: string;
  withdrawnAt: string | null;
};

export type StudioApiResult<T> = { ok: true; value: T } | { ok: false; error: string };
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

const unavailable = "安全登录服务暂不可用";

export function createStudioApiClient(fetcher: Fetcher = fetch) {
  async function request<T>(url: string, init?: RequestInit): Promise<StudioApiResult<T>> {
    try {
      const response = await fetcher(url, { credentials: "same-origin", ...init });
      const payload = await response.json().catch(() => null) as { data?: T; error?: unknown } | null;
      if (response.ok && payload?.data !== undefined) return { ok: true, value: payload.data };
      if (response.status === 401) return { ok: false, error: "请先完成安全登录" };
      return { ok: false, error: typeof payload?.error === "string" ? payload.error : unavailable };
    } catch {
      return { ok: false, error: unavailable };
    }
  }

  function mutation(method: "PATCH" | "PUT" | "POST", body: unknown, key: string): RequestInit {
    return {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(body),
    };
  }

  return {
    getProfile: () => request<StudioProfileResponse>("/api/studio/profile"),
    updateProfile: (profile: Omit<StudioProfileResponse, "displayName" | "email">, key: string) =>
      request<StudioProfileResponse>("/api/studio/profile", mutation("PATCH", profile, key)),
    getDraft: (campaignId: string) => request<{ campaignId: string; content: string }>(`/api/studio/opportunities/${encodeURIComponent(campaignId)}/draft`),
    saveDraft: (campaignId: string, content: string, key: string) =>
      request<{ campaignId: string; content: string }>(`/api/studio/opportunities/${encodeURIComponent(campaignId)}/draft`, mutation("PUT", { content }, key)),
    submitApplication: (campaignId: string, note: string, key: string) =>
      request<StudioApplicationResponse>(`/api/studio/opportunities/${encodeURIComponent(campaignId)}/applications`, mutation("POST", { note }, key)),
    withdrawApplication: (applicationId: string, key: string) =>
      request<StudioApplicationResponse>(`/api/studio/applications/${encodeURIComponent(applicationId)}/withdraw`, mutation("POST", {}, key)),
    listApplications: () => request<StudioApplicationResponse[]>("/api/studio/applications"),
  };
}

export const studioApi = createStudioApiClient();
