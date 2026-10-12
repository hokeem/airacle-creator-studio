import assert from 'node:assert/strict';
import { createDemoStudioClient } from './data-access/demo-studio-client';
import { selectStudioRuntime } from './data-access/studio-runtime';

const campaign = { id: 'campaign-1', brandName: 'Brand', title: 'Campaign', summary: 'Demo', region: 'global', platform: 'X', compensationMinorUnits: 12500, compensationCurrency: 'USD', deadline: '2026-12-31', deliverables: ['Post'], requirements: ['Disclose'] };
const client = createDemoStudioClient({
  seed: {
    session: { id: 'session-1', creatorId: 'creator-1' },
    profile: { id: 'creator-1', displayName: 'Creator', email: 'creator@example.test', region: 'global', language: 'en', topics: [], socialUrl: '' },
    opportunities: [campaign],
  },
  now: () => '2026-10-09T00:00:00.000Z',
});
const meta = { requestId: 'request-1', idempotencyKey: 'key-1' };

assert.deepEqual(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_MODE: 'remote', NEXT_PUBLIC_CREATOR_API_URL: 'https://api.example.test' }), { mode: 'remote', capability: 'unavailable', apiBaseUrl: 'https://api.example.test/' });
assert.deepEqual(await client.withdrawApplication({ applicationId: 'missing' }, meta), { ok: false, error: { code: 'not_found', message: 'Application was not found in local demo data.' } });
const draft = { opportunityId: campaign.id, content: 'Pitch' };
const saved = await client.saveApplicationDraft({ draft }, meta);
assert.deepEqual(await client.saveApplicationDraft({ draft }, meta), saved);
assert.deepEqual(await client.saveApplicationDraft({ draft: { ...draft, content: 'Changed' } }, meta), { ok: false, error: { code: 'conflict', message: 'Idempotency key has already been used for a different request.' } });
assert.deepEqual(await client.saveApplicationDraft({ draft: { ...draft, content: 'Changed' } }, { requestId: 'request-2', idempotencyKey: 'key-2' }), { ok: true, value: { ...draft, content: 'Changed' } });
assert.deepEqual(await client.submitApplication({ opportunityId: 'missing', draft: { opportunityId: 'missing', content: 'Pitch' } }, { requestId: 'request-3', idempotencyKey: 'key-3' }), { ok: false, error: { code: 'not_found', message: 'Opportunity was not found in local demo data.' } });
assert.deepEqual(await client.submitApplication({ opportunityId: campaign.id, draft: { opportunityId: 'other', content: 'Pitch' } }, { requestId: 'request-4', idempotencyKey: 'key-4' }), { ok: false, error: { code: 'invalid_request', message: 'Application draft must belong to the requested opportunity.' } });
const submitted = await client.submitApplication({ opportunityId: campaign.id, draft }, { requestId: 'request-5', idempotencyKey: 'key-5' });
assert.deepEqual(await client.submitApplication({ opportunityId: campaign.id, draft }, { requestId: 'request-5', idempotencyKey: 'key-5' }), submitted);
assert.deepEqual(await client.submitApplication({ opportunityId: campaign.id, draft: { ...draft, content: 'Changed' } }, { requestId: 'request-5', idempotencyKey: 'key-6' }), { ok: false, error: { code: 'conflict', message: 'Request ID has already been used with a different idempotency key.' } });
console.log('PASS: fail-closed remote runtime, safe withdraw, idempotency replay/conflicts, and submit validation.');
