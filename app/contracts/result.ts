export type StudioErrorCode = 'unavailable' | 'demo_only' | 'read_only' | 'not_found' | 'invalid_request' | 'conflict' | 'unauthorized';

export type StudioError = {
  code: StudioErrorCode;
  message: string;
};

export type Success<T> = { ok: true; value: T };
export type Failure = { ok: false; error: StudioError };
export type Result<T> = Success<T> | Failure;
export type StudioResult<T> = Result<T>;

export const success = <T>(value: T): Success<T> => ({ ok: true, value });

export const failure = (code: StudioErrorCode, message: string): Failure => ({
  ok: false,
  error: { code, message },
});
