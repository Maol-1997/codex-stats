export interface AuthData {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    accountId: string;
    email: string;
    planType: string;
}

export interface RateLimitWindow {
    used_percent: number;
    window_minutes?: number;
    resets_in_seconds?: number;
}

export interface RateLimits {
    primary?: RateLimitWindow;
    secondary?: RateLimitWindow;
}
