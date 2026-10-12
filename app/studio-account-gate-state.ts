export type AccountGateState =
  | { kind: "signed-out" }
  | { kind: "signed-in"; email: string; displayName: string }
  | { kind: "unavailable" };

type ProfileResponse = {
  email?: unknown;
  displayName?: unknown;
  name?: unknown;
  profile?: {
    email?: unknown;
    displayName?: unknown;
    name?: unknown;
  };
};

export function accountGateStateFor(input: {
  status: number;
  body?: unknown;
}): AccountGateState {
  if (input.status === 401) return { kind: "signed-out" };
  if (input.status !== 200 || !isProfileResponse(input.body)) {
    return { kind: "unavailable" };
  }

  const profile = input.body.profile ?? input.body;
  const email = text(profile.email);
  if (!email) return { kind: "unavailable" };

  return {
    kind: "signed-in",
    email,
    displayName: text(profile.displayName) || text(profile.name) || email,
  };
}

function isProfileResponse(value: unknown): value is ProfileResponse {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
