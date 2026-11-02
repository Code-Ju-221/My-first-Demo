const SUPABASE_URL = "https://yqgtksbnfeszmrcvbhuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_S18EV4VlX5hNrCxvdJVTsQ_IFtn2VNs";
const QQ_EMAIL_PATTERN = /^[1-9]\d{4,11}@qq\.com$/i;

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

export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

export function isValidQqEmail(email) {
    return QQ_EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isValidNickname(nickname) {
    const value = nickname.trim();
    return value.length >= 2 && value.length <= 24;
}
