import {
    supabase,
    isValidNickname,
    isValidQqEmail,
    normalizeEmail
} from "./supabase-client.js";

const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const scene = document.getElementById("flipScene");

const signupForm = document.getElementById("signupForm");
const signupDetails = document.getElementById("signupDetails");
const signupVerification = document.getElementById("signupVerification");
const signupNicknameInput = document.getElementById("signupNickname");
const signupEmailInput = document.getElementById("signupEmail");
const signupPasswordInput = document.getElementById("signupPassword");
const signupCodeInput = document.getElementById("signupCode");
const sendCodeButton = document.getElementById("sendCodeButton");
const verifyCodeButton = document.getElementById("verifyCodeButton");
const verificationEmail = document.getElementById("verificationEmail");
const signupMessage = document.getElementById("signupMessage");
const resendCodeLink = document.getElementById("resendCode");
const changeSignupDetailsLink = document.getElementById("changeSignupDetails");

let pendingEmail = "";
let pendingPassword = "";
let resendTimer = null;

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

function getFriendlyError(error, fallback) {
    const message = error?.message || "";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("rate limit")) {
        return "Too many emails were requested. Please wait a minute and try again.";
    }

    if (lowerMessage.includes("already registered") || lowerMessage.includes("already been registered")) {
        return "This QQ email is already registered. Please log in instead.";
    }

    if (lowerMessage.includes("expired") || lowerMessage.includes("invalid")) {
        return "The verification code is incorrect or has expired. Use the latest email and try again.";
    }

    return message || fallback;
}

function showSignupDetails() {
    signupDetails.classList.remove("hidden");
    signupVerification.classList.add("hidden");
    signupCodeInput.value = "";
    setMessage(signupMessage, "");
}

function showVerificationStep(email) {
    signupDetails.classList.add("hidden");
    signupVerification.classList.remove("hidden");
    verificationEmail.textContent = email;
    signupCodeInput.focus();
}

function startResendCountdown(seconds = 60) {
    window.clearInterval(resendTimer);

    let remaining = seconds;
    resendCodeLink.classList.add("disabled");
    resendCodeLink.setAttribute("aria-disabled", "true");
    resendCodeLink.textContent = `Resend in ${remaining}s`;

    resendTimer = window.setInterval(() => {
        remaining -= 1;

        if (remaining <= 0) {
            window.clearInterval(resendTimer);
            resendCodeLink.classList.remove("disabled");
            resendCodeLink.removeAttribute("aria-disabled");
            resendCodeLink.textContent = "Resend code";
            return;
        }

        resendCodeLink.textContent = `Resend in ${remaining}s`;
    }, 1000);
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

sendCodeButton.addEventListener("click", async () => {
    const nickname = signupNicknameInput.value.trim();
    const email = normalizeEmail(signupEmailInput.value);
    const password = signupPasswordInput.value;

    if (!isValidNickname(nickname)) {
        setMessage(signupMessage, "Nickname must contain 2-24 characters.", "error");
        return;
    }

    if (!isValidQqEmail(email)) {
        setMessage(signupMessage, "Enter a valid QQ email, for example 123456@qq.com.", "error");
        return;
    }

    if (password.length < 8) {
        setMessage(signupMessage, "Password must contain at least 8 characters.", "error");
        return;
    }

    setButtonState(sendCodeButton, true, "Sending...", "Send Verification Code");
    setMessage(signupMessage, "Sending an 8-digit code to your QQ email...");

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nickname }
            }
        });

        if (error) {
            throw error;
        }

        if (data.session) {
            await supabase.auth.signOut();
            throw new Error("Email confirmation is disabled in Supabase. Enable Confirm email before testing registration.");
        }

        pendingEmail = email;
        pendingPassword = password;
        showVerificationStep(email);
        startResendCountdown();
        setMessage(signupMessage, "Code sent. It is valid for 10 minutes.", "success");
    } catch (error) {
        console.error(error);
        setMessage(signupMessage, getFriendlyError(error, "Could not send the verification code."), "error");
    } finally {
        setButtonState(sendCodeButton, false, "Sending...", "Send Verification Code");
    }
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (signupVerification.classList.contains("hidden")) {
        sendCodeButton.click();
        return;
    }

    const token = signupCodeInput.value.replace(/\s/g, "");

    if (!/^\d{8}$/.test(token)) {
        setMessage(signupMessage, "Enter the complete 8-digit verification code.", "error");
        return;
    }

    setButtonState(verifyCodeButton, true, "Verifying...", "Verify & Create Account");
    setMessage(signupMessage, "Verifying your email...");

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email: pendingEmail,
            token,
            type: "email"
        });

        if (error) {
            throw error;
        }

        if (!data.session) {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: pendingEmail,
                password: pendingPassword
            });

            if (loginError) {
                throw loginError;
            }
        }

        setMessage(signupMessage, "Account created. Opening your workspace...", "success");
        goToDashboard();
    } catch (error) {
        console.error(error);
        setMessage(signupMessage, getFriendlyError(error, "Verification failed."), "error");
    } finally {
        setButtonState(verifyCodeButton, false, "Verifying...", "Verify & Create Account");
    }
});

resendCodeLink.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!pendingEmail || resendCodeLink.classList.contains("disabled")) {
        return;
    }

    resendCodeLink.classList.add("disabled");
    setMessage(signupMessage, "Sending a new code...");

    try {
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: pendingEmail
        });

        if (error) {
            throw error;
        }

        signupCodeInput.value = "";
        startResendCountdown();
        setMessage(signupMessage, "A new 8-digit code has been sent.", "success");
    } catch (error) {
        console.error(error);
        resendCodeLink.classList.remove("disabled");
        resendCodeLink.removeAttribute("aria-disabled");
        resendCodeLink.textContent = "Resend code";
        setMessage(signupMessage, getFriendlyError(error, "Could not resend the code."), "error");
    }
});

changeSignupDetailsLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.clearInterval(resendTimer);
    pendingEmail = "";
    pendingPassword = "";
    resendCodeLink.classList.remove("disabled");
    resendCodeLink.removeAttribute("aria-disabled");
    resendCodeLink.textContent = "Resend code";
    showSignupDetails();
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = normalizeEmail(loginEmailInput.value);
    const password = passwordInput.value;

    if (!isValidQqEmail(email) || !password) {
        setMessage(loginMessage, "Enter a valid QQ email and password.", "error");
        return;
    }

    setButtonState(loginButton, true, "Signing In...", "Sign In");
    setMessage(loginMessage, "Checking your account...");

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw error;
        }

        setMessage(loginMessage, "Login successful. Redirecting...", "success");
        goToDashboard();
    } catch (error) {
        console.error(error);
        setMessage(loginMessage, "Incorrect email or password, or the email has not been verified.", "error");
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
