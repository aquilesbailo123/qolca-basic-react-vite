
export const ROUTES = {
    main: "/",
    home: "/home",

    // Auth
    login: "/login",
    register: "/register",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    changePassword: "/change-password",

    // Main
    profile: "/profile",
    notFound: "*",
};

export const API_ROUTES = {
    // Auth
    login: "/auth/login/",
    logout: "/auth/logout/",
    refresh: "/auth/token/refresh/",
    signup: "/auth/registration/",
    resendEmail: "/resend-email-confirmation/",
    confirmEmail: "/auth/registration/account-confirm-email/",
    changePassword: "/auth/password/change/",
    resetPassword: "/auth/password/reset/",
    resetPasswordConfirm: "/auth/password/reset/confirm/",

    // Other
    profile: "/api/auth/profile/",
}

// Only these paths dont require to send a token
// See /lib/axios.ts
export const NO_AUTH_REQUIRED_API_ROUTES = [
    API_ROUTES.login,
    API_ROUTES.refresh,
    API_ROUTES.signup,
    API_ROUTES.resendEmail,
    API_ROUTES.confirmEmail,
    API_ROUTES.resetPassword,
    API_ROUTES.resetPasswordConfirm,
]