import type { ApiSuccessResponse } from '../../../shared/model/api.types';
import type { CurrencyCode, IsoDateTimeString, Uuid } from '../../../shared/model/common.types';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type TokenType = 'Bearer';

export type AuthUser = {
  avatarUrl: string | null;
  createdAt: IsoDateTimeString;
  defaultCurrency: CurrencyCode;
  displayName: string;
  email: string;
  id: Uuid;
  lastLoginAt: IsoDateTimeString | null;
  locale: string | null;
  status: UserStatus;
  timeZone: string | null;
  updatedAt: IsoDateTimeString;
};

export type AuthSession = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: IsoDateTimeString;
  tokenType: TokenType;
  user: AuthUser;
};

export type GoogleLoginRequest = {
  idToken: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type LogoutResponse = {
  loggedOut: boolean;
};

export type CurrentUser = AuthUser;

export type AuthSessionResponse = ApiSuccessResponse<AuthSession>;

export type CurrentUserResponse = ApiSuccessResponse<CurrentUser>;

export type LogoutApiResponse = ApiSuccessResponse<LogoutResponse>;
