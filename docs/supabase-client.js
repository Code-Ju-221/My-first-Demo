const SUPABASE_URL = "https://yqgtksbnfeszmrcvbhuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_S18EV4VlX5hNrCxvdJVTsQ_IFtn2VNs";
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/;

if (!window.supabase?.createClient) {
    throw new Error("Supabase client library failed to load.");
}

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

export function normalizeUsername(username) {
    return username.trim().toLowerCase();
}

export function isValidUsername(username) {
    return USERNAME_PATTERN.test(username.trim());
}

export function usernameToEmail(username) {
    return `${normalizeUsername(username)}@users.login-sp.invalid`;
}
