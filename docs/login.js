import {
    supabase,
    isValidUsername,
    usernameToEmail
} from "./supabase-client.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const scene = document.getElementById("flipScene");
const signupForm = document.getElementById("signupForm");
const signupButton = document.getElementById("signupButton");
const signupMessage = document.getElementById("signupMessage");

function setMessage(element, text, type = "") {
    element.textContent = text;
    element.className = `form-message ${type}`.trim();
}

function setButtonState(button, disabled, busyText, normalText) {
    button.disabled = disabled;
    button.textContent = disabled ? busyText : normalText;
}

function goToDashboard() {
    window.location.replace("dashboard.html");
}

async function readFunctionError(error) {
    try {
        if (error?.context && typeof error.context.json === "function") {
            const body = await error.context.json();
            return body.error || body.message || error.message;
        }
    } catch {
        // Use the standard SDK error when the response body is not JSON.
    }

    return error?.message || "Registration failed.";
}

document.getElementById("toSignup").addEventListener("click", (event) => {
    event.preventDefault();
    setMessage(loginMessage, "");
    scene.classList.add("flipped");
});

document.getElementById("toLogin").addEventListener("click", (event) => {
    event.preventDefault();
    setMessage(signupMessage, "");
    scene.classList.remove("flipped");
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!isValidUsername(username)) {
        setMessage(signupMessage, "Use 3-24 letters, numbers or underscores.", "error");
        return;
    }

    if (password.length < 8) {
        setMessage(signupMessage, "Password must contain at least 8 characters.", "error");
        return;
    }

    setButtonState(signupButton, true, "Creating...", "Create Account");
    setMessage(signupMessage, "Creating your account...");

    try {
        const { error: registerError } = await supabase.functions.invoke("register-username", {
            body: { username, password }
        });

        if (registerError) {
            throw new Error(await readFunctionError(registerError));
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: usernameToEmail(username),
            password
        });

        if (loginError) {
            throw loginError;
        }

        setMessage(signupMessage, "Account created. Opening your workspace...", "success");
        goToDashboard();
    } catch (error) {
        console.error(error);
        setMessage(signupMessage, error.message || "Registration failed.", "error");
    } finally {
        setButtonState(signupButton, false, "Creating...", "Create Account");
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!isValidUsername(username) || !password) {
        setMessage(loginMessage, "Enter a valid username and password.", "error");
        return;
    }

    setButtonState(loginButton, true, "Signing In...", "Sign In");
    setMessage(loginMessage, "Checking your account...");

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: usernameToEmail(username),
            password
        });

        if (error) {
            throw error;
        }

        setMessage(loginMessage, "Login successful. Redirecting...", "success");
        goToDashboard();
    } catch (error) {
        console.error(error);
        setMessage(loginMessage, "Incorrect username or password.", "error");
    } finally {
        setButtonState(loginButton, false, "Signing In...", "Sign In");
    }
});

async function redirectExistingSession() {
    const { data, error } = await supabase.auth.getSession();

    if (!error && data.session) {
        goToDashboard();
    }
}

redirectExistingSession();
