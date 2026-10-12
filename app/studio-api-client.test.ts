import assert from "node:assert/strict";
import { createStudioApiClient } from "./studio-api-client";

const requests: Array<{ url: string; init?: RequestInit }> = [];
const client = createStudioApiClient(async (url, init) => {
  requests.push({ url, init });
  return Response.json({ data: { id: "app-1", campaignId: "dji-air", note: "Pitch", status: "submitted", submittedAt: "2026-10-09T00:00:00.000Z", withdrawnAt: null } });
});

const application = await client.submitApplication("dji-air", "Pitch", "submit-0001");
assert.equal(application.ok, true);
assert.deepEqual(requests[0], {
  url: "/api/studio/opportunities/dji-air/applications",
  init: {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "Idempotency-Key": "submit-0001" },
    body: JSON.stringify({ note: "Pitch" }),
  },
});

const unavailable = createStudioApiClient(async () => new Response("down", { status: 503 }));
assert.deepEqual(await unavailable.getProfile(), { ok: false, error: "安全登录服务暂不可用" });

console.log("PASS: Studio API client uses same-origin, idempotency, and truthful failure states.");
