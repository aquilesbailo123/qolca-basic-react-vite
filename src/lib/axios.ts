// lib/axios.ts
import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from 'axios';
import { NO_AUTH_REQUIRED_API_ROUTES, API_ROUTES, LOGOUT_ERROR_CODES } from '@/constants';
import { useAuthStore } from '@/stores/useAuthStore';

// ============================================
// Instance
// ============================================

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/',
    // withCredentials: true,
});

// ============================================
// Request Interceptor
// ============================================

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (NO_AUTH_REQUIRED_API_ROUTES.includes(config.url || '')) {
            return config;
        }

        const token = await useAuthStore.getState().getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor
// ============================================

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const { response, config: originalRequest } = error;
        
        if (!response || !originalRequest) {
            return Promise.reject(error);
        }

        const { status } = response;
        const { logOut, getAccessToken } = useAuthStore.getState();

        // 503 - Maintenance
        if (status === 503) {
            return Promise.reject(error);
        }

        // 401 - Unauthorized
        if (status === 401) {
            const errorCode = (response.data as any)?.code?.message || '';

            if (LOGOUT_ERROR_CODES.includes(errorCode)) {
                logOut();
                return Promise.reject(error);
            }

            const shouldAttemptRefresh =
                !NO_AUTH_REQUIRED_API_ROUTES.includes(originalRequest.url || '') &&
                originalRequest.url !== API_ROUTES.refresh;

            if (shouldAttemptRefresh) {
                try {
                    const newToken = await getAccessToken();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch {
                    logOut();
                }
            }
        }

        return Promise.reject(error);
    }
);