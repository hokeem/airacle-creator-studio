import assert from 'node:assert/strict';
import type {
  CapabilityState,
  MutationMeta,
  StudioApplication,
  StudioApplicationDraft,
  StudioCampaign,
  StudioCapabilities,
  StudioProfile,
  StudioResult,
} from './contracts/studio';
import { createDemoStudioClient } from './data-access/demo-studio-client';
import { selectStudioRuntime } from './data-access/studio-runtime';

const meta: MutationMeta = { requestId: 'request-1', idempotencyKey: 'idem-1' };
const profile: StudioProfile = { id: 'creator-1', displayName: 'Creator', email: 'creator@example.test', region: '全球', language: '中文', topics: [], socialUrl: '' };
const campaign: StudioCampaign = { id: 'campaign-1', brandName: 'Brand', title: 'Campaign', summary: 'Demo', region: '全球', platform: 'X', compensationMinorUnits: 125_00, compensationCurrency: 'USD', deadline: '2026-12-31', deliverables: ['Post'], requirements: ['Disclose'] };
const capabilities: StudioCapabilities = { canRead: true, canMutate: true, persistence: 'demo' };
const capability: CapabilityState = 'demo-only';
const typedResult: StudioResult<StudioProfile> = { ok: true, value: profile };
assert.equal(campaign.compensationMinorUnits, 125_00);
assert.equal(capabilities.persistence, 'demo');
assert.equal(capability, 'demo-only');
assert.equal(typedResult.ok, true);

assert.deepEqual(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_MODE: 'demo', NEXT_PUBLIC_CREATOR_API_URL: 'not-a-url' }), { mode: 'demo', capability: 'demo-only' });
assert.deepEqual(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_MODE: 'remote' }), { mode: 'remote', capability: 'unavailable' });
assert.deepEqual(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_MODE: 'remote', NEXT_PUBLIC_CREATOR_API_URL: 'https://api.example.test' }), { mode: 'remote', capability: 'unavailable', apiBaseUrl: 'https://api.example.test/' });

const client = createDemoStudioClient({
  seed: { session: { id: 'session-1', creatorId: profile.id }, profile, opportunities: [campaign] },
  now: () => '2026-10-09T00:00:00.000Z',
});
assert.equal((await client.getSession()).ok, true);
assert.equal((await client.getProfile()).ok, true);
assert.equal((await client.listOpportunities()).ok, true);
assert.equal((await client.getOpportunity(campaign.id)).ok, true);
assert.equal((await client.getApplicationDraft(campaign.id)).ok, false);
const invalidMeta = await client.updateProfile({ profile }, { requestId: '', idempotencyKey: '' });
assert.deepEqual(invalidMeta, { ok: false, error: { code: 'invalid_request', message: 'A request ID and idempotency key are required.' } });
assert.equal((await client.updateProfile({ profile: { ...profile, displayName: 'Updated' } }, meta)).ok, true);
const saved = await client.saveApplicationDraft({ draft: { opportunityId: campaign.id, content: 'Pitch' } }, { requestId: 'request-3', idempotencyKey: 'idem-3' });
assert.deepEqual(saved, { ok: true, value: { opportunityId: campaign.id, content: 'Pitch' } });
assert.deepEqual(await client.getApplicationDraft(campaign.id), saved);
const submitted = await client.submitApplication({ opportunityId: campaign.id, draft: { opportunityId: campaign.id, content: 'Pitch' } }, { requestId: 'request-4', idempotencyKey: 'idem-4' });
assert.equal(submitted.ok, true);
if (submitted.ok) {
  const application: StudioApplication = submitted.value;
  assert.deepEqual(application, { id: 'application-campaign-1', opportunityId: campaign.id, status: 'submitted', submittedAt: '2026-10-09T00:00:00.000Z' });
  assert.deepEqual(await client.withdrawApplication({ applicationId: application.id }, { requestId: 'request-5', idempotencyKey: 'idem-5' }), { ok: true, value: { ...application, status: 'withdrawn' } });
}
console.log('PASS: review compatibility exports, modes, mutation metadata, and deterministic demo lifecycle.');
