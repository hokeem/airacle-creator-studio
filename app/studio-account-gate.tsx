"use client";

import { useEffect, useState } from "react";
import { accountGateStateFor, type AccountGateState } from "./studio-account-gate-state";

const PROFILE_ENDPOINT = "/api/studio/profile";
const SIGN_IN_HREF = "/signin-with-chatgpt?return_to=/";

type GateViewState = { kind: "checking" } | AccountGateState;

/**
 * A display-only account status for Studio. The server remains the identity
 * authority; this component neither creates nor persists an identity.
 */
export default function StudioAccountGate() {
  const [state, setState] = useState<GateViewState>({ kind: "checking" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(PROFILE_ENDPOINT, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const body = response.status === 200 ? await response.json().catch(() => undefined) : undefined;
        if (!controller.signal.aborted) {
          setState(accountGateStateFor({ status: response.status, body }));
        }
      } catch {
        if (!controller.signal.aborted) setState({ kind: "unavailable" });
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, []);

  if (state.kind === "checking") {
    return <span role="status">正在检查安全登录状态…</span>;
  }

  if (state.kind === "signed-out") {
    return (
      <a href={SIGN_IN_HREF} target="_top" className="text-btn">
        安全登录
      </a>
    );
  }

  if (state.kind === "signed-in") {
    return (
      <span aria-label={`已登录：${state.displayName}，${state.email}`}>
        {state.displayName} · {state.email}
      </span>
    );
  }

  return <span role="status">安全登录服务暂不可用</span>;
}
