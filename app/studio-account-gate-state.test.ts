import assert from "node:assert/strict";
import { accountGateStateFor } from "./studio-account-gate-state";

assert.deepEqual(accountGateStateFor({ status: 401 }), {
  kind: "signed-out",
});

assert.deepEqual(
  accountGateStateFor({
    status: 200,
    body: { email: "creator@example.com", displayName: "Creator Name" },
  }),
  { kind: "signed-in", email: "creator@example.com", displayName: "Creator Name" },
);

assert.deepEqual(accountGateStateFor({ status: 200, body: { email: "" } }), {
  kind: "unavailable",
});

assert.deepEqual(accountGateStateFor({ status: 503 }), {
  kind: "unavailable",
});

console.log("PASS: account gate only reports authenticated profile responses as signed in.");
