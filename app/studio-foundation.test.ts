import assert from 'node:assert/strict';
import { failure, success } from './contracts/result';
import type { ApplicationDraft, CreatorProfile, OpportunityDetail, Session } from './contracts/studio';

const session: Session = { id: 'session-1', creatorId: 'creator-1' };
const profile: CreatorProfile = {
  id: session.creatorId,
  displayName: 'When2buy',
  email: 'creator@example.com',
  region: '中国',
  language: '中文',
  topics: ['影像'],
  socialUrl: 'https://x.com/your_account',
};
const opportunity: OpportunityDetail = {
  id: 'opportunity-1',
  brandName: 'DJI',
  title: 'Creator project',
  summary: 'A demo opportunity',
  region: '全球',
  platform: 'YouTube',
  compensationMinorUnits: 180000,
  compensationCurrency: 'USD',
  deadline: '2026-10-15',
  deliverables: ['Video'],
  requirements: ['Use original footage'],
};
const draft: ApplicationDraft = { opportunityId: opportunity.id, content: 'My pitch' };

assert.equal(success(draft).ok, true);
assert.deepEqual(failure('unavailable', 'Demo-only client').error, {
  code: 'unavailable',
  message: 'Demo-only client',
});
assert.equal(profile.id, session.creatorId);
console.log('PASS: shared studio contracts and typed result helpers.');
