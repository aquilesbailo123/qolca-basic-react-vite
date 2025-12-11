// store/useAuthStore.ts
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

import { api } from '@/lib/axios';
import { authRateLimiter } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';
import { API_ROUTES, STORAGE_KEYS, TOKEN_REFRESH_THRESHOLD_MS, AUTH_MESSAGES } from '@/constants';

import type {
    User,
    AuthResult,
    LoginRequest,
    LoginResponse,
    LoginErrorResponse,
    SignupRequest,
    ResetPasswordRequest,
    ResetPasswordConfirmRequest,
    ChangePasswordRequest,
    TokenResponse,
    ConfirmEmailResponse,
} from '@/types/auth';

// ============================================
// Helpers
// ============================================

const storage = {
    getAccessToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    getUser: (): User | null => {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : null;
    },
    setTokens: (access: string, refresh: string) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    },
    setUser: (user: User) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },
};

const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const isTokenExpiringSoon = (token: string): boolean => {
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        const timeToExpire = exp * 1000 - Date.now();
        return timeToExpire <= TOKEN_REFRESH_THRESHOLD_MS;
    } catch {
        return true;
    }
};

// ============================================
// Store
// ============================================

interface AuthState {
    isLogged: boolean;
    isLoading: boolean;
}

interface AuthActions {
    logIn: (credentials: LoginRequest, onRequire2FA: () => void) => Promise<AuthResult>;
    logOut: () => Promise<void>;
    getAccessToken: () => Promise<string | undefined>;
    getUser: () => User | null;
    
    register: (data: SignupRequest) => Promise<boolean>;
    resendConfirmationEmail: (token: string) => Promise<boolean>;
    confirmEmail: (code: string) => Promise<boolean>;
    
    requestPasswordReset: (data: ResetPasswordRequest) => Promise<boolean>;
    resetPassword: (data: ResetPasswordConfirmRequest) => Promise<boolean>;
    changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
    // State
    isLogged: isTokenValid(storage.getRefreshToken()),
    isLoading: false,

    // ----------------------------------------
    // Authentication
    // ----------------------------------------

    logIn: async (credentials, onRequire2FA) => {
        // Check rate limit before attempting login
        const rateLimitCheck = authRateLimiter.checkLimit(credentials.email);
        if (!rateLimitCheck.isAllowed) {
            const minutes = Math.ceil((rateLimitCheck.retryAfter || 0) / 60);
            toast.error(`Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`);
            return 'error';
        }

        set({ isLoading: true });
        toast.dismiss();

        try {
            const { data } = await api.post<LoginResponse>(API_ROUTES.login, credentials);

            // Successful login - reset rate limit
            authRateLimiter.reset(credentials.email);

            storage.setTokens(data.access, data.refresh);
            storage.setUser(data.user);
            set({ isLogged: true, isLoading: false });

            return 'success';
        } catch (error: any) {
            set({ isLoading: false });

            // Record failed attempt for rate limiting
            authRateLimiter.recordAttempt(credentials.email);

            if (credentials.googlecode) return 'otp_fail';

            const errorData: LoginErrorResponse = error?.response?.data;
            if (!errorData) return 'error';

            // Email not confirmed - resend confirmation
            if (errorData.token?.[0]) {
                const sent = await get().resendConfirmationEmail(errorData.token[0]);
                return sent ? 'confirm_email' : 'error';
            }

            // 2FA required
            const errorType = errorData.type?.[0] || errorData.message?.[0];
            if (errorType === 'two_fa_failed') {
                onRequire2FA();
                return 'go2fa';
            }

            // Known error types
            const knownErrors: AuthResult[] = ['wrong_data', 'reset_psw', 'account_block', 'invalid'];
            if (errorType && knownErrors.includes(errorType as AuthResult)) {
                toast.error(AUTH_MESSAGES[errorType as keyof typeof AUTH_MESSAGES] || AUTH_MESSAGES.error);
                return errorType as AuthResult;
            }

            return 'error';
        }
    },

    logOut: async () => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            await api.post(API_ROUTES.logout);
        } catch (error) {
            logger.error('Logout request failed', error);
        }

        storage.clear();
        set({ isLogged: false, isLoading: false });
    },

    getAccessToken: async () => {
        const accessToken = storage.getAccessToken();
        const refreshToken = storage.getRefreshToken();

        if (!accessToken) return undefined;

        // Token still valid
        if (!isTokenExpiringSoon(accessToken)) {
            return accessToken;
        }

        // Need to refresh
        if (!refreshToken) {
            get().logOut();
            return undefined;
        }

        try {
            const { data } = await api.post<TokenResponse>(API_ROUTES.refresh, {
                refresh: refreshToken,
            });

            storage.setTokens(data.access, data.refresh);
            return data.access;
        } catch (error) {
            logger.error('Token refresh failed', error);
            get().logOut();
            return undefined;
        }
    },

    getUser: () => storage.getUser(),

    // ----------------------------------------
    // Registration
    // ----------------------------------------

    register: async (data) => {
        if (data.password1 !== data.password2) {
            toast.error(AUTH_MESSAGES.passwords_mismatch);
            return false;
        }

        set({ isLoading: true });
        toast.dismiss();

        try {
            await api.post(API_ROUTES.signup, data);
            toast.success(AUTH_MESSAGES.register_success);
            return true;
        } catch (error: any) {
            const errorData = error?.response?.data;
            if (errorData?.email) toast.error(AUTH_MESSAGES.bad_email);
            else if (errorData?.non_field_errors) toast.error(AUTH_MESSAGES.bad_data);
            else toast.error(AUTH_MESSAGES.error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    resendConfirmationEmail: async (token) => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            const { data } = await api.post(API_ROUTES.resendEmail, { token });
            if (!data.Status) throw new Error('Resend failed');
            toast.success(AUTH_MESSAGES.resent_code);
            return true;
        } catch (error) {
            logger.error('Failed to resend confirmation', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    confirmEmail: async (code) => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            const { data } = await api.post<ConfirmEmailResponse>(API_ROUTES.confirmEmail, {
                key: code,
            });

            if (data.access_token && data.refresh_token) {
                storage.setTokens(data.access_token, data.refresh_token);
                if (data.user) storage.setUser(data.user);
                set({ isLogged: true });
                toast.success(AUTH_MESSAGES.email_confirmed_and_logged_in);
            } else {
                toast.success(AUTH_MESSAGES.email_confirmed);
            }

            return true;
        } catch (error) {
            logger.error('Email confirmation failed', error);
            toast.error(AUTH_MESSAGES.error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    // ----------------------------------------
    // Password Management
    // ----------------------------------------

    requestPasswordReset: async (data) => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            await api.post(API_ROUTES.resetPassword, data);
            toast.success(AUTH_MESSAGES.email_sent);
            return true;
        } catch (error: any) {
            if (error?.response?.data?.email) {
                toast.error(AUTH_MESSAGES.bad_email);
            }
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    resetPassword: async (data) => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            await api.post(API_ROUTES.resetPasswordConfirm, data);
            toast.success(AUTH_MESSAGES.password_reset_request_success);
            return true;
        } catch (error: any) {
            const errorData = error?.response?.data;
            if (errorData?.uid || errorData?.token) {
                toast.error(AUTH_MESSAGES.invalid_data);
            } else {
                toast.error(AUTH_MESSAGES.error);
            }
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    changePassword: async (data) => {
        set({ isLoading: true });
        toast.dismiss();

        try {
            await api.post(API_ROUTES.changePassword, data);
            toast.success(AUTH_MESSAGES.password_reset_success);
            return true;
        } catch (error: any) {
            const errorCode = error?.response?.data?.code as keyof typeof AUTH_MESSAGES;
            toast.error(AUTH_MESSAGES[errorCode] || AUTH_MESSAGES.error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },
}));