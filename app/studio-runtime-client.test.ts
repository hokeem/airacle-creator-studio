import assert from 'node:assert/strict';
import { createDemoStudioClient } from './data-access/demo-studio-client';
import { featureStatusFor, selectStudioRuntime } from './data-access/studio-runtime';

assert.deepEqual(selectStudioRuntime(), { mode: 'demo', capability: 'demo-only' });
assert.equal(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_API_BASE_URL: 'ftp://api.example.test' }).mode, 'demo');
assert.deepEqual(selectStudioRuntime({ NEXT_PUBLIC_STUDIO_MODE: 'remote', NEXT_PUBLIC_CREATOR_API_URL: 'https://api.example.test/studio' }), {
  mode: 'remote',
  capability: 'unavailable',
  apiBaseUrl: 'https://api.example.test/studio',
});
assert.deepEqual(featureStatusFor('read-only'), { canRead: true, canMutate: false, persistence: 'remote' });
assert.deepEqual(featureStatusFor('unavailable'), { canRead: false, canMutate: false, persistence: 'none' });

const client = createDemoStudioClient();
const missingKey = await client.updateProfile({
  profile: { id: 'creator-1', displayName: 'Name', email: 'creator@example.com', region: '中国', language: '中文', topics: [], socialUrl: '' },
}, { requestId: '', idempotencyKey: '' });
assert.deepEqual(missingKey, { ok: false, error: { code: 'invalid_request', message: 'A request ID and idempotency key are required.' } });

const noRemoteWrite = await client.saveApplicationDraft({ draft: { opportunityId: 'opportunity-1', content: 'Pitch' } }, { requestId: 'request-1', idempotencyKey: 'request-1' });
assert.deepEqual(noRemoteWrite, { ok: true, value: { opportunityId: 'opportunity-1', content: 'Pitch' } });
console.log('PASS: runtime selection, capability mapping, and local demo mutation behavior.');
