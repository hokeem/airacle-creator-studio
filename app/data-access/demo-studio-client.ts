import { failure, success } from '../contracts/result';
import type { Result } from '../contracts/result';
import type {
  Application,
  ApplicationDraft,
  CreatorProfile,
  MutationMeta,
  OpportunityDetail,
  OpportunitySummary,
  Session,
  StudioId,
} from '../contracts/studio';
import type { StudioClient } from './studio-client';

export type DemoStudioSeed = {
  session: Session;
  profile: CreatorProfile;
  opportunities: OpportunityDetail[];
  drafts?: ApplicationDraft[];
  applications?: Application[];
};

export type DemoStudioClientOptions = {
  seed?: DemoStudioSeed;
  now?: () => string;
};

export const demoPersistence = 'local-demo' as const;

const defaultSeed: DemoStudioSeed = {
  session: { id: 'demo-session', creatorId: 'demo-creator' },
  profile: { id: 'demo-creator', displayName: 'Demo Creator', email: 'demo@example.test', region: 'global', language: 'zh', topics: [], socialUrl: '' },
  opportunities: [],
};

const copy = <T>(value: T): T => structuredClone(value);
const missing = (kind: string) => failure('not_found', `${kind} was not found in local demo data.`);
const validMeta = (meta: MutationMeta) => Boolean(meta.requestId.trim() && meta.idempotencyKey.trim());

export const createDemoStudioClient = (options: DemoStudioClientOptions = {}): StudioClient => {
  const seed = options.seed ?? defaultSeed;
  let session = copy(seed.session);
  let profile = copy(seed.profile);
  const opportunities = new Map<StudioId, OpportunityDetail>(seed.opportunities.map((opportunity) => [opportunity.id, copy(opportunity)]));
  const drafts = new Map<StudioId, ApplicationDraft>((seed.drafts ?? []).map((draft) => [draft.opportunityId, copy(draft)]));
  const applications = new Map<StudioId, Application>((seed.applications ?? []).map((application) => [application.id, copy(application)]));
  const mutations = new Map<string, { requestId: string; fingerprint: string; result: Result<unknown> }>();
  const requestKeys = new Map<string, string>();
  const now = options.now ?? (() => '2026-01-01T00:00:00.000Z');

  const mutate = <T>(operation: string, request: unknown, meta: MutationMeta, change: () => Result<T>): Result<T> => {
    if (!validMeta(meta)) return failure('invalid_request', 'A request ID and idempotency key are required.');
    const fingerprint = `${operation}:${JSON.stringify(request)}`;
    const existing = mutations.get(meta.idempotencyKey);
    if (existing) {
      return existing.requestId === meta.requestId && existing.fingerprint === fingerprint
        ? copy(existing.result) as Result<T>
        : failure('conflict', 'Idempotency key has already been used for a different request.');
    }
    const requestKey = requestKeys.get(meta.requestId);
    if (requestKey && requestKey !== meta.idempotencyKey) {
      return failure('conflict', 'Request ID has already been used with a different idempotency key.');
    }
    const result = change();
    mutations.set(meta.idempotencyKey, { requestId: meta.requestId, fingerprint, result: copy(result) });
    requestKeys.set(meta.requestId, meta.idempotencyKey);
    return result;
  };

  return {
    async getSession() { return success(copy(session)); },
    async getProfile() { return success(copy(profile)); },
    async updateProfile(request, meta) {
      return mutate('updateProfile', request, meta, () => {
        profile = copy(request.profile);
        session = { ...session, creatorId: profile.id };
        return success(copy(profile));
      });
    },
    async listOpportunities() {
      return success(Array.from(opportunities.values(), (opportunity): OpportunitySummary => {
        const { deliverables: _deliverables, requirements: _requirements, ...summary } = opportunity;
        return copy(summary);
      }));
    },
    async getOpportunity(opportunityId) {
      const opportunity = opportunities.get(opportunityId);
      return opportunity ? success(copy(opportunity)) : missing('Opportunity');
    },
    async getApplicationDraft(opportunityId) {
      const draft = drafts.get(opportunityId);
      return draft ? success(copy(draft)) : missing('Application draft');
    },
    async saveApplicationDraft(request, meta) {
      return mutate('saveApplicationDraft', request, meta, () => {
        const draft = copy(request.draft);
        drafts.set(draft.opportunityId, draft);
        return success(copy(draft));
      });
    },
    async submitApplication(request, meta) {
      return mutate('submitApplication', request, meta, () => {
        if (!opportunities.has(request.opportunityId)) return missing('Opportunity');
        if (request.draft.opportunityId !== request.opportunityId) {
          return failure('invalid_request', 'Application draft must belong to the requested opportunity.');
        }
        const applicationId = `application-${request.opportunityId}`;
        const existing = applications.get(applicationId);
        if (existing) return success(copy(existing));
        const application: Application = {
          id: applicationId,
          opportunityId: request.opportunityId,
          status: 'submitted',
          submittedAt: now(),
        };
        drafts.set(request.opportunityId, copy(request.draft));
        applications.set(application.id, application);
        return success(copy(application));
      });
    },
    async withdrawApplication(request, meta) {
      return mutate('withdrawApplication', request, meta, () => {
        const application = applications.get(request.applicationId);
        if (!application) return missing('Application');
        const withdrawn: Application = { ...application, status: 'withdrawn' };
        applications.set(withdrawn.id, withdrawn);
        return success(copy(withdrawn));
      });
    },
  };
};
