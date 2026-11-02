import { supabase } from "./supabase-client.js";

const usernameElements = document.querySelectorAll("[data-username]");
const userInitial = document.getElementById("userInitial");
const profileInitial = document.getElementById("profileInitial");
const sessionMessage = document.getElementById("sessionMessage");
const currentSection = document.getElementById("currentSection");
const greeting = document.getElementById("greeting");
const navigationItems = document.querySelectorAll(".nav-item[data-target]");
const logoutButtons = [
    document.getElementById("logoutButton"),
    document.getElementById("topLogoutButton")
].filter(Boolean);

function goToLogin() {
    window.location.replace("index.html");
}

function setGreeting() {
    const hour = new Date().getHours();

    if (hour < 6) {
        greeting.textContent = "夜深了";
    } else if (hour < 12) {
        greeting.textContent = "早上好";
    } else if (hour < 18) {
        greeting.textContent = "下午好";
    } else {
        greeting.textContent = "晚上好";
    }
}

function setActiveSection(sectionId, label) {
    currentSection.textContent = label;

    navigationItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.target === sectionId);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);

    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

navigationItems.forEach((item) => {
    item.addEventListener("click", () => {
        scrollToSection(item.dataset.target);
    });
});

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => {
        scrollToSection(button.dataset.scrollTo);
    });
});

document.getElementById("scrollTopButton").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".project-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const projectCard = button.closest(".project-card");
        const expanded = projectCard.classList.toggle("expanded");

        button.setAttribute("aria-expanded", String(expanded));
        button.querySelector("span").textContent = expanded ? "收起项目详情" : "查看项目详情";
    });
});

const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visibleSections.length) {
        return;
    }

    const section = visibleSections[0].target;
    setActiveSection(section.id, section.dataset.sectionLabel);
}, {
    rootMargin: "-24% 0px -58% 0px",
    threshold: [0, .15, .35, .6]
});

document.querySelectorAll(".portfolio-section").forEach((section) => {
    sectionObserver.observe(section);
});

async function loadCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            goToLogin();
            return;
        }

        const nickname = data.user.user_metadata?.nickname
            || data.user.email?.split("@")[0]
            || "user";
        const initial = nickname.charAt(0).toUpperCase();

        usernameElements.forEach((element) => {
            element.textContent = nickname;
        });

        userInitial.textContent = initial;
        profileInitial.textContent = initial;
    } catch (error) {
        console.error(error);
        sessionMessage.textContent = "无法连接到 Supabase，请稍后重试。";
    }
}

async function signOut() {
    logoutButtons.forEach((button) => {
        button.disabled = true;
    });
    sessionMessage.textContent = "正在退出登录...";

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        goToLogin();
    } catch (error) {
        console.error(error);
        sessionMessage.textContent = "退出失败，请重试。";
        logoutButtons.forEach((button) => {
            button.disabled = false;
        });
    }
}

logoutButtons.forEach((button) => {
    button.addEventListener("click", signOut);
});

supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
        goToLogin();
    }
});

setGreeting();
loadCurrentUser();
