import { supabase } from "./supabase-client.js";

const usernameElements = document.querySelectorAll("[data-username]");
const userInitial = document.getElementById("userInitial");
const profileInitial = document.getElementById("profileInitial");
const sessionMessage = document.getElementById("sessionMessage");
const currentSection = document.getElementById("currentSection");
const greeting = document.getElementById("greeting");
const navigationItems = document.querySelectorAll(".nav-item[data-target]");
const portfolioSections = document.querySelectorAll(".portfolio-section");
const logoutButtons = [
    document.getElementById("logoutButton"),
    document.getElementById("topLogoutButton")
].filter(Boolean);
const projectModal = document.getElementById("projectModal");
const projectDialogKind = document.getElementById("projectDialogKind");
const projectDialogStatus = document.getElementById("projectDialogStatus");
const projectDialogDate = document.getElementById("projectDialogDate");
const projectDialogTitle = document.getElementById("projectDialogTitle");
const projectDialogSummary = document.getElementById("projectDialogSummary");
const projectDialogTags = document.getElementById("projectDialogTags");
const projectDialogFacts = document.getElementById("projectDialogFacts");
const projectDialogLinks = document.getElementById("projectDialogLinks");
const projectDemo = document.getElementById("projectDemo");
const projectCloseButton = projectModal.querySelector(".project-close");

const projectData = {
    portfolio: {
        kind: "FEATURED WEB PROJECT",
        status: "持续开发",
        date: "2026.08 — NOW",
        title: "个人数字档案网站",
        summary: "一个需要登录后访问的个人展示网站。从认证流程、开场动画到分栏目个人档案，完整实践前端开发、云端认证和静态部署。",
        tags: ["HTML", "CSS", "JavaScript", "Supabase", "GitHub Pages"],
        facts: [
            ["目标", "建立一个便于他人了解我的长期个人数字档案。"],
            ["功能", "QQ邮箱验证码注册、登录鉴权、响应式布局、栏目切换和项目展示。"],
            ["设计", "使用灰红色拟物视觉体系，并通过轻量动画表达界面状态变化。"],
            ["职责", "需求规划、视觉设计、前端开发、Supabase配置和上线测试均独立完成。"]
        ],
        demo: {
            type: "concept",
            icon: "fa-solid fa-fingerprint",
            title: "你正在浏览这个项目",
            description: "当前个人档案网站本身就是该项目的在线成果，因此这里不重复嵌套页面。"
        },
        links: [
            ["查看 GitHub 仓库", "https://github.com/Code-Ju-221/My-first-Demo", "fa-brands fa-github"]
        ]
    },
    foundation: {
        kind: "LEARNING ARCHIVE",
        status: "持续更新",
        date: "STARTED 2026.08",
        title: "ESP32 基础学习记录",
        summary: "将 ESP32 学习过程中完成的基础实验按模块整理到 GitHub，用真实代码记录从外设控制到网络通信的学习过程。",
        tags: ["ESP32", "C", "PlatformIO", "Arduino IDE"],
        facts: [
            ["基础实验", "LED、按键、数码管、点阵屏、蜂鸣器、继电器与舵机控制。"],
            ["通信外设", "ADC、I²C、SPI、UART、Wi-Fi、SD卡和网络请求。"],
            ["控制能力", "PWM呼吸灯、外部中断、定时器中断、步进电机和PS2摇杆。"],
            ["记录方式", "每项实验保留独立代码目录，持续更新并形成可回看的学习路径。"]
        ],
        demo: {
            type: "concept",
            icon: "fa-solid fa-code-branch",
            title: "代码学习档案",
            description: "该项目以代码仓库为主要展示形式，进入仓库可以查看每项基础实验。"
        },
        links: [
            ["查看学习仓库", "https://github.com/Code-Ju-221/My-ESP32-Foundation", "fa-brands fa-github"]
        ]
    },
    eid: {
        kind: "IOT / EMBEDDED SYSTEM",
        status: "持续完善",
        date: "COMPLETED 2026.08",
        title: "ESP32 智能电子名片",
        summary: "一套由嵌入式终端、Supabase云数据库和Web管理端组成的智能电子名片系统。用户在网页修改资料，实体设备联网获取并分页显示最新内容。",
        tags: ["ESP32", "ST7735", "Supabase", "HTTPS", "REST", "JSON"],
        facts: [
            ["系统架构", "ESP32硬件终端 + Supabase云端 + 原生HTML/JavaScript管理端。"],
            ["硬件交互", "ST7735彩色屏展示姓名、联系方式、简介与荣誉，单按键切换页面。"],
            ["关键技术", "HTTPS/REST通信、JSON解析、中文点阵字库、Auth认证与RLS数据隔离。"],
            ["项目亮点", "名片内容与设备固件分离，云端修改资料后无需重新烧录程序。"],
            ["当前进度", "网页链路、Wi-Fi、屏幕显示与翻页已完成，设备读取云端数据仍在联调。"],
            ["参赛经历", "参加2026年西安理工大学理奥杯，比赛结果尚未公布。"]
        ],
        demo: {
            type: "video",
            src: "assets/eid-demo.mp4",
            title: "ESP32智能电子名片演示视频"
        },
        links: [
            ["查看项目仓库", "https://github.com/Code-Ju-221/ESP32-Project1-E-ID", "fa-brands fa-github"]
        ]
    },
    birthday: {
        kind: "WEB ANIMATION",
        status: "已完成",
        date: "2026.11.02",
        title: "Happy Birthday Mom",
        summary: "一个为妈妈制作的轻量生日祝福网页，以动画蛋糕为视觉核心，用简单的前端代码表达祝福。",
        tags: ["HTML", "CSS", "Animation"],
        facts: [
            ["主题", "用网页形式制作一份可以直接打开观看的生日祝福。"],
            ["动画", "蛋糕的不同层级从页面上方依次落下，最终组合成完整蛋糕。"],
            ["特点", "内容简单直接，重点放在节奏明确的动画呈现。"],
            ["职责", "页面设计、动画实现和在线部署均独立完成。"]
        ],
        demo: {
            type: "iframe",
            src: "https://code-ju-221.github.io/Happy-Birthday-Mom/",
            title: "Happy Birthday Mom 在线演示"
        },
        links: [
            ["新窗口打开演示", "https://code-ju-221.github.io/Happy-Birthday-Mom/", "fa-solid fa-arrow-up-right-from-square"]
        ]
    },
    valentine: {
        kind: "INTERACTIVE WEB",
        status: "已完成",
        date: "2026.11.01",
        title: "Will You Be My Valentine",
        summary: "一个围绕 Yes 与 No 选择设计的趣味互动网页，通过按钮尺寸变化和确认动画让简单选择产生戏剧化反馈。",
        tags: ["HTML", "CSS", "JavaScript", "Interaction"],
        facts: [
            ["交互规则", "点击No后，No按钮逐渐变小，Yes按钮持续变大。"],
            ["确认反馈", "点击Yes后进入开心的庆祝动画。"],
            ["体验目标", "用直观、轻松的交互制造趣味和情绪变化。"],
            ["职责", "页面设计、交互逻辑和在线部署均独立完成。"]
        ],
        demo: {
            type: "iframe",
            src: "https://code-ju-221.github.io/will-you-be-my-valentine/",
            title: "Will You Be My Valentine 在线演示"
        },
        links: [
            ["新窗口打开演示", "https://code-ju-221.github.io/will-you-be-my-valentine/", "fa-solid fa-arrow-up-right-from-square"]
        ]
    }
};

let projectOpener = null;
let projectCloseTimer = null;

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

function showSection(sectionId, updateHistory = true) {
    const section = document.getElementById(sectionId);

    if (!section || !section.classList.contains("portfolio-section")) {
        return;
    }

    const label = section.dataset.sectionLabel;
    const alreadyActive = section.classList.contains("is-active");
    currentSection.textContent = label;

    portfolioSections.forEach((item) => {
        const isActive = item === section;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-hidden", String(!isActive));
    });

    navigationItems.forEach((item) => {
        const isActive = item.dataset.target === sectionId;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (updateHistory && !alreadyActive) {
        window.history.pushState({ sectionId }, "", `#${sectionId}`);
    }

    window.scrollTo({ top: 0, behavior: "auto" });

    window.requestAnimationFrame(() => {
        section.focus({ preventScroll: true });
    });
}

navigationItems.forEach((item) => {
    item.addEventListener("click", () => {
        showSection(item.dataset.target);
    });
});

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => {
        showSection(button.dataset.scrollTo);
    });
});

document.getElementById("scrollTopButton").addEventListener("click", () => {
    showSection("home");
});

window.addEventListener("popstate", () => {
    const requestedSection = window.location.hash.slice(1) || "home";
    const sectionId = document.getElementById(requestedSection)?.classList.contains("portfolio-section")
        ? requestedSection
        : "home";
    showSection(sectionId, false);
});

function renderProjectDemo(demo) {
    projectDemo.replaceChildren();

    if (demo.type === "iframe") {
        const iframe = document.createElement("iframe");
        iframe.src = demo.src;
        iframe.title = demo.title;
        iframe.loading = "lazy";
        iframe.allow = "fullscreen";
        projectDemo.append(iframe);
        return;
    }

    if (demo.type === "video") {
        const video = document.createElement("video");
        video.src = demo.src;
        video.title = demo.title;
        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        projectDemo.append(video);
        return;
    }

    const concept = document.createElement("div");
    concept.className = "project-demo-concept";

    const icon = document.createElement("i");
    icon.className = demo.icon;
    const title = document.createElement("strong");
    title.textContent = demo.title;
    const description = document.createElement("p");
    description.textContent = demo.description;

    concept.append(icon, title, description);
    projectDemo.append(concept);
}

function openProject(projectId, opener) {
    const project = projectData[projectId];

    if (!project) {
        return;
    }

    window.clearTimeout(projectCloseTimer);
    projectOpener = opener;
    projectDialogKind.textContent = project.kind;
    projectDialogStatus.textContent = project.status;
    projectDialogDate.textContent = project.date;
    projectDialogTitle.textContent = project.title;
    projectDialogSummary.textContent = project.summary;

    projectDialogTags.replaceChildren(...project.tags.map((tag) => {
        const item = document.createElement("span");
        item.textContent = tag;
        return item;
    }));

    projectDialogFacts.replaceChildren(...project.facts.map(([term, description]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = term;
        dd.textContent = description;
        row.append(dt, dd);
        return row;
    }));

    projectDialogLinks.replaceChildren(...project.links.map(([label, url, iconClass]) => {
        const link = document.createElement("a");
        const icon = document.createElement("i");
        const text = document.createElement("span");
        link.href = url;
        link.target = "_blank";
        link.rel = "noreferrer";
        icon.className = iconClass;
        text.textContent = label;
        link.append(icon, text);
        return link;
    }));

    renderProjectDemo(project.demo);
    projectModal.hidden = false;
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(() => {
        projectModal.classList.add("is-open");
        projectCloseButton.focus();
    });
}

function closeProject() {
    if (projectModal.hidden) {
        return;
    }

    projectModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    projectCloseTimer = window.setTimeout(() => {
        projectModal.hidden = true;
        projectDemo.replaceChildren();
        projectOpener?.focus();
    }, 360);
}

document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
        openProject(button.dataset.project, button);
    });
});

document.querySelectorAll("[data-close-project]").forEach((button) => {
    button.addEventListener("click", closeProject);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !projectModal.hidden) {
        closeProject();
    }
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

        if (!userInitial.querySelector("img")) {
            userInitial.textContent = initial;
        }

        if (!profileInitial.querySelector("img")) {
            profileInitial.textContent = initial;
        }
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
const requestedSection = window.location.hash.slice(1) || "home";
const initialSection = document.getElementById(requestedSection)?.classList.contains("portfolio-section")
    ? requestedSection
    : "home";
showSection(initialSection, false);
loadCurrentUser();
