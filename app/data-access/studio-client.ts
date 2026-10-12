import type {
  Application,
  ApplicationDraft,
  MutationMeta,
  OpportunityDetail,
  OpportunitySummary,
  SaveApplicationDraftRequest,
  Session,
  StudioId,
  SubmitApplicationRequest,
  UpdateProfileRequest,
  WithdrawApplicationRequest,
  CreatorProfile,
} from '../contracts/studio';
import type { Result } from '../contracts/result';

export interface StudioClient {
  getSession(): Promise<Result<Session>>;
  getProfile(): Promise<Result<CreatorProfile>>;
  updateProfile(request: UpdateProfileRequest, meta: MutationMeta): Promise<Result<CreatorProfile>>;
  listOpportunities(): Promise<Result<OpportunitySummary[]>>;
  getOpportunity(opportunityId: StudioId): Promise<Result<OpportunityDetail>>;
  getApplicationDraft(opportunityId: StudioId): Promise<Result<ApplicationDraft>>;
  saveApplicationDraft(request: SaveApplicationDraftRequest, meta: MutationMeta): Promise<Result<ApplicationDraft>>;
  submitApplication(request: SubmitApplicationRequest, meta: MutationMeta): Promise<Result<Application>>;
  withdrawApplication(request: WithdrawApplicationRequest, meta: MutationMeta): Promise<Result<Application>>;
}
