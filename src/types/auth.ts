// ============================================
// User
// ============================================

export interface User {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    actions_freezed_till?: string;
}

// Alias for backwards compatibility
export type UserDetails = User;

// ============================================
// Auth Results
// ============================================

export type AuthResult =
    | 'success'
    | 'confirm_email'
    | 'go2fa'
    | 'otp_fail'
    | 'wrong_data'
    | 'reset_psw'
    | 'account_block'
    | 'invalid'
    | 'error';

// ============================================
// Request Payloads
// ============================================

export interface LoginRequest {
    email: string;
    password: string;
    googlecode?: string;
}

export interface SignupRequest {
    email: string;
    password1: string;
    password2: string;
    username?: string;
    captcha_response?: string;
}

export interface ResetPasswordRequest {
    email: string;
    captcha?: string;
}

export interface ResetPasswordConfirmRequest {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password1: string;
    new_password2: string;
}

// ============================================
// Response Payloads
// ============================================

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface LoginErrorResponse {
    message?: string[];
    type?: string[];
    token?: string[];
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface ConfirmEmailResponse {
    detail: string;
    access_token?: string;
    refresh_token?: string;
    user?: User;
}