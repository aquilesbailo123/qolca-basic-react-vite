import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount: number, error: any) => {
                // Do not retry on 401/403
                const status = error?.response?.status;
                if (status === 401 || status === 403) return false;
                return failureCount < 2;
            },
            staleTime: 30_000,
        },
        mutations: {
            retry: 0,
        },
    },
});
