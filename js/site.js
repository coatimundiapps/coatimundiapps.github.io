/* ============================================================
   site.js — unifié : langues, thème, captures, lightbox,
   menu mobile et animations d'apparition.
   Chaque page définit `window.TRANSLATIONS` avant d'inclure
   ce script.
   ============================================================ */
(function () {
    "use strict";

    const dict = window.TRANSLATIONS || { en: {}, fr: {}, zh: {} };
    const LS_LANG = "coatimundi-lang";
    const LS_THEME = "coatimundi-theme";

    /* ---------- Traductions ---------- */
    function applyTranslation(lang) {
        const d = dict[lang] || {};
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (d[key] != null) el.innerHTML = d[key];
        });
        document.documentElement.lang = lang;
        document.querySelectorAll(".lang-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });
        localStorage.setItem(LS_LANG, lang);
    }

    /* ---------- Thème ---------- */
    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        localStorage.setItem(LS_THEME, theme);

        document.querySelectorAll("img.screenshot").forEach((img) => {
            const base = img.getAttribute("data-target");
            if (base) img.src = "assets/" + base + "-" + theme + ".png";
        });

        document.querySelectorAll(".theme-thumb").forEach((btn) => {
            const target = btn.getAttribute("data-target") || "";
            btn.classList.toggle("active", target.endsWith("-" + theme));
        });
    }

    /* ---------- Lightbox ---------- */
    window.openLightbox = function (src) {
        const img = document.getElementById("lightbox-img");
        const box = document.getElementById("lightbox");
        if (!img || !box) return;
        img.src = src;
        box.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.closeLightbox = function () {
        const box = document.getElementById("lightbox");
        if (!box) return;
        box.classList.remove("active");
        document.body.style.overflow = "";
    };

    /* ---------- Initialisation ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        /* 1. Langue */
        const savedLang = localStorage.getItem(LS_LANG);
        const browserLang = navigator.language.substring(0, 2);
        const initialLang =
            savedLang && dict[savedLang]
                ? savedLang
                : ["fr", "zh"].includes(browserLang)
                ? browserLang
                : "fr";
        applyTranslation(initialLang);

        document.querySelectorAll(".lang-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                if (dict[lang]) applyTranslation(lang);
            });
        });

        /* 2. Thème */
        const savedTheme = localStorage.getItem(LS_THEME);
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            if (!localStorage.getItem(LS_THEME)) {
                applyTheme(e.matches ? "dark" : "light");
            }
        });

        /* 3. Switchers clair/sombre des captures (synchronisés) */
        document.querySelectorAll(".theme-switcher").forEach((switcher) => {
            switcher.querySelectorAll(".theme-thumb").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const target = btn.getAttribute("data-target") || "";
                    applyTheme(target.endsWith("-dark") ? "dark" : "light");
                });
            });
        });

        /* 4. Lightbox */
        document.querySelectorAll("img.screenshot").forEach((img) => {
            img.addEventListener("click", () => window.openLightbox(img.src));
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") window.closeLightbox();
        });

        /* 5. Menu mobile */
        const toggle = document.querySelector(".nav-toggle");
        if (toggle) {
            toggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
            document.querySelectorAll(".nav-links a").forEach((a) => {
                a.addEventListener("click", () => document.body.classList.remove("nav-open"));
            });
        }

        /* 6. Animations d'apparition au scroll */
        if ("IntersectionObserver" in window) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                            io.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12 }
            );
            document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
        } else {
            document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
        }

        /* 7. Ombre du header au scroll */
        const header = document.querySelector("header");
        if (header) {
            const updateHeaderShadow = () => {
                header.classList.toggle("scrolled", window.scrollY > 10);
            };
            window.addEventListener("scroll", updateHeaderShadow, { passive: true });
            updateHeaderShadow();
        }
    });
})();
