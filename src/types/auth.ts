export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface AuthActionResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
