export type StudioId = string;
export type IdempotencyKey = string;
export type MutationMeta = { requestId: string; idempotencyKey: IdempotencyKey };
// Monetary amounts are integer minor units (for example, cents), never floating point major units.
export type IntegerMinorUnits = number;

export type Session = {
  id: StudioId;
  creatorId: StudioId;
};

export type CreatorProfile = {
  id: StudioId;
  displayName: string;
  email: string;
  region: string;
  language: string;
  topics: string[];
  socialUrl: string;
};

export type OpportunitySummary = {
  id: StudioId;
  brandName: string;
  title: string;
  summary: string;
  region: string;
  platform: string;
  compensationMinorUnits: IntegerMinorUnits;
  compensationCurrency: string;
  deadline: string;
};

export type OpportunityDetail = OpportunitySummary & {
  deliverables: string[];
  requirements: string[];
};

export type ApplicationDraft = {
  opportunityId: StudioId;
  content: string;
};

export type ApplicationStatus = 'submitted' | 'withdrawn';

export type Application = {
  id: StudioId;
  opportunityId: StudioId;
  status: ApplicationStatus;
  submittedAt: string;
};

export type UpdateProfileRequest = {
  profile: CreatorProfile;
};

export type SaveApplicationDraftRequest = {
  draft: ApplicationDraft;
};

export type SubmitApplicationRequest = {
  opportunityId: StudioId;
  draft: ApplicationDraft;
};

export type WithdrawApplicationRequest = {
  applicationId: StudioId;
};

export type StudioProfile = CreatorProfile;
export type StudioCampaign = OpportunityDetail;
export type StudioApplicationDraft = ApplicationDraft;
export type StudioApplication = Application;
export type CapabilityState = 'live' | 'read-only' | 'demo-only' | 'unavailable';
export type StudioCapabilities = { canRead: boolean; canMutate: boolean; persistence: 'remote' | 'demo' | 'none' };
export type { StudioResult } from './result';
