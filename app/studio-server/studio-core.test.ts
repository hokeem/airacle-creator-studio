import assert from "node:assert/strict";
import {
  StudioHttpError,
  createInMemoryStudioRepository,
  createStudioService,
  type StudioActor,
} from "./core";

const alice: StudioActor = {
  siteUserId: "site-alice",
  email: "alice@example.com",
  displayName: "Alice",
};
const bob: StudioActor = {
  siteUserId: "site-bob",
  email: "bob@example.com",
  displayName: "Bob",
};

const service = createStudioService(createInMemoryStudioRepository(), {
  campaigns: new Set(["dji-air", "insta-outdoor"]),
  now: () => "2026-10-09T12:00:00.000Z",
  createApplicationId: () => "application-1",
});

await assert.rejects(
  () => service.getProfile(null),
  (error: unknown) => error instanceof StudioHttpError && error.status === 401,
);

const profile = await service.updateProfile(alice, {
  displayName: "Alice Creator",
  region: "中国",
  language: "中文",
  topics: ["影像", "旅行"],
  socialUrl: "https://x.com/alice",
}, "profile-key-0001");
assert.equal(profile.email, "alice@example.com");
assert.equal(profile.displayName, "Alice");
assert.deepEqual((await service.getProfile(alice)).topics, ["影像", "旅行"]);
assert.equal((await service.getProfile(bob)).displayName, "Bob");

const draft = await service.saveDraft(alice, "dji-air", { content: "My authentic pitch" }, "draft-key-0001");
assert.equal(draft.content, "My authentic pitch");
assert.equal((await service.getDraft(alice, "dji-air")).content, "My authentic pitch");
await assert.rejects(
  () => service.saveDraft(alice, "unknown-campaign", { content: "Nope" }, "draft-key-0002"),
  (error: unknown) => error instanceof StudioHttpError && error.status === 404,
);

const first = await service.submitApplication(alice, "dji-air", { note: "Ready to film" }, "submit-key-0001");
const replay = await service.submitApplication(alice, "dji-air", { note: "Ready to film" }, "submit-key-0001");
assert.deepEqual(replay, first);
await assert.rejects(
  () => service.submitApplication(alice, "dji-air", { note: "A different request" }, "submit-key-0001"),
  (error: unknown) => error instanceof StudioHttpError && error.status === 409,
);
await assert.rejects(
  () => service.submitApplication(alice, "dji-air", { note: "Duplicate campaign" }, "submit-key-0002"),
  (error: unknown) => error instanceof StudioHttpError && error.status === 409,
);
assert.equal((await service.listApplications(alice)).length, 1);
await assert.rejects(
  () => service.withdrawApplication(bob, first.id, "withdraw-key-001"),
  (error: unknown) => error instanceof StudioHttpError && error.status === 404,
);
assert.equal((await service.withdrawApplication(alice, first.id, "withdraw-key-001")).status, "withdrawn");

const concurrent = createStudioService(createInMemoryStudioRepository(), { campaigns: new Set(["dji-air"]), now: () => "2026-10-09T12:00:00.000Z", createApplicationId: () => "concurrent-application" });
const simultaneous = await Promise.allSettled([concurrent.submitApplication(alice, "dji-air", { note: "Concurrent" }, "concurrent-key-0001"), concurrent.submitApplication(alice, "dji-air", { note: "Concurrent" }, "concurrent-key-0001")]);
assert.equal(simultaneous.filter((result) => result.status === "fulfilled").length, 1);
assert.equal(simultaneous.filter((result) => result.status === "rejected").length, 1);
const pending = simultaneous.find((result) => result.status === "rejected");
assert.ok(pending && pending.status === "rejected" && pending.reason instanceof StudioHttpError && pending.reason.status === 409);
const afterPending = await concurrent.submitApplication(alice, "dji-air", { note: "Concurrent" }, "concurrent-key-0001");
assert.equal(afterPending.id, "concurrent-application");

console.log("PASS: Studio server core keeps users isolated and persists profiles, drafts, applications, idempotency, and withdrawals.");
