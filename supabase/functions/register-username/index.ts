import { createClient } from "jsr:@supabase/supabase-js@2.102.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed." }, 405);
    }

    try {
        const { username, password } = await request.json();
        const displayUsername = typeof username === "string" ? username.trim() : "";
        const normalizedUsername = displayUsername.toLowerCase();

        if (!/^[A-Za-z0-9_]{3,24}$/.test(displayUsername)) {
            return jsonResponse({ error: "Use 3-24 letters, numbers or underscores." }, 400);
        }

        if (typeof password !== "string" || password.length < 8) {
            return jsonResponse({ error: "Password must contain at least 8 characters." }, 400);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ error: "Supabase server configuration is missing." }, 500);
        }

        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { error } = await admin.auth.admin.createUser({
            email: `${normalizedUsername}@users.login-sp.invalid`,
            password,
            email_confirm: true,
            user_metadata: {
                username: displayUsername
            }
        });

        if (error) {
            const duplicate = /already|registered|exists/i.test(error.message);
            return jsonResponse({
                error: duplicate ? "This username is already registered." : "Account creation failed."
            }, duplicate ? 409 : 400);
        }

        return jsonResponse({ success: true }, 201);
    } catch (error) {
        console.error(error);
        return jsonResponse({ error: "Invalid registration request." }, 400);
    }
});
