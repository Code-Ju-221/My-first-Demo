import { supabase } from "./supabase-client.js";

const usernameElements = document.querySelectorAll("[data-username]");
const userInitial = document.getElementById("userInitial");
const sessionMessage = document.getElementById("sessionMessage");
const logoutButton = document.getElementById("logoutButton");
const currentSection = document.getElementById("currentSection");
const viewTitle = document.getElementById("viewTitle");
const viewDescription = document.getElementById("viewDescription");
const panelTitle = document.getElementById("panelTitle");
const greeting = document.getElementById("greeting");

const views = {
    home: {
        label: "Home",
        title: "Your workspace",
        description: "A flexible foundation for whatever this product becomes.",
        panel: "Start with a clear canvas"
    },
    overview: {
        label: "Overview",
        title: "Workspace overview",
        description: "A neutral summary area ready for the metrics that matter later.",
        panel: "Your overview will live here"
    },
    projects: {
        label: "Projects",
        title: "Projects",
        description: "A structured home for active, paused and completed work.",
        panel: "Create your first project"
    },
    messages: {
        label: "Messages",
        title: "Messages",
        description: "Conversation space is ready to connect when the product theme is defined.",
        panel: "Your conversations will appear here"
    },
    settings: {
        label: "Settings",
        title: "Settings",
        description: "Account and workspace preferences can be added in this section.",
        panel: "Shape the workspace around you"
    }
};

function goToLogin() {
    window.location.replace("index.html");
}

function setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent = "Good morning";
    } else if (hour < 18) {
        greeting.textContent = "Good afternoon";
    } else {
        greeting.textContent = "Good evening";
    }
}

function updateView(viewName) {
    const view = views[viewName];

    if (!view) {
        return;
    }

    currentSection.textContent = view.label;
    viewTitle.textContent = view.title;
    viewDescription.textContent = view.description;
    panelTitle.textContent = view.panel;

    document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
        item.classList.toggle("active", item.dataset.view === viewName);
    });
}

async function loadCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            goToLogin();
            return;
        }

        const username = data.user.user_metadata?.username
            || data.user.email?.split("@")[0]
            || "user";

        usernameElements.forEach((element) => {
            element.textContent = username;
        });

        userInitial.textContent = username.charAt(0).toUpperCase();
    } catch (error) {
        console.error(error);
        sessionMessage.textContent = "Cannot connect to Supabase.";
    }
}

document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    item.addEventListener("click", () => {
        updateView(item.dataset.view);
    });
});

document.getElementById("primaryAction").addEventListener("click", () => {
    sessionMessage.textContent = "This action is ready to connect when the site theme is decided.";

    window.setTimeout(() => {
        sessionMessage.textContent = "";
    }, 3200);
});

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    sessionMessage.textContent = "Signing out...";

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        goToLogin();
    } catch (error) {
        console.error(error);
        sessionMessage.textContent = "Sign out failed. Please try again.";
        logoutButton.disabled = false;
    }
});

supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
        goToLogin();
    }
});

setGreeting();
loadCurrentUser();
