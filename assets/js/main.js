/**
 * Project GVM - Main Site Logic
 * Optimized for GitHub Pages (Shared Components & Calculator Launcher)
 */
const GVMApp = (function() {
    'use strict';

    // --- 1. Configuration ---
    const config = {
        appUrl: "https://gvmcalculator.streamlit.app/?embed=true&theme=light",
        selectors: {
            headerPlaceholder: "#header-placeholder",
            footerPlaceholder: "#footer-placeholder",
            year: "#year",
            checkbox: "#acknowledge",
            startBtn: "#startBtn",
            appContainer: "#app-container",
            iframe: "#gvm-frame",
            loader: "#loader",
            intro: ".card-intro", 
            wrapper: ".main-wrapper",
            faqDetails: ".faq-item details",
            // Navigation Selectors
            navToggle: ".navbar-toggle",
            navMenu: ".nav-menu",
            navLinks: ".nav-links, .dropdown-menu a"
        }
    };

    // --- 2. Mobile Menu Logic (UPDATED: Event Delegation) ---
    const initMobileMenu = () => {
        // We attach the listener to the 'document' instead of the button directly.
        // This catches the click regardless of when the header was loaded.
        document.addEventListener('click', (e) => {
            
            // A. Check if the clicked element (or its parent) is the Toggle Button
            const toggleBtn = e.target.closest(config.selectors.navToggle);
            
            if (toggleBtn) {
                e.preventDefault();
                const navMenu = document.querySelector(config.selectors.navMenu);
                if (navMenu) {
                    navMenu.classList.toggle('active');
                    toggleBtn.classList.toggle('active'); // Animates the hamburger
                }
                return; // Stop processing to avoid conflicts
            }

            // B. Close menu if clicking a LINK inside the menu
            if (e.target.matches(config.selectors.navLinks)) {
                 const navMenu = document.querySelector(config.selectors.navMenu);
                 const activeBtn = document.querySelector(config.selectors.navToggle);
                 
                 if (navMenu && navMenu.classList.contains('active')) {
                     navMenu.classList.remove('active');
                     if (activeBtn) activeBtn.classList.remove('active');
                 }
                 return;
            }

            // C. Close menu if clicking OUTSIDE the menu (Optional UX Polish)
            const navMenu = document.querySelector(config.selectors.navMenu);
            if (navMenu && navMenu.classList.contains('active')) {
                // If click is NOT on the menu and NOT on the toggle button
                if (!e.target.closest(config.selectors.navMenu)) {
                    navMenu.classList.remove('active');
                    const activeBtn = document.querySelector(config.selectors.navToggle);
                    if (activeBtn) activeBtn.classList.remove('active');
                }
            }
        });
    };

    // --- 3. UI Methods ---

    const initDynamicYear = () => {
        const yearEl = document.querySelector(config.selectors.year);
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    };

    const trackEvent = (name, label) => {
        if (typeof gtag === 'function') {
            gtag('event', name, {
                'event_category': 'GVM Calculator',
                'event_label': label
            });
        }
    };

    // --- FAQ Logic ---
    const initFAQ = () => {
        const acc = document.getElementsByClassName("faq-question");
        for (let i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                const panel = this.nextElementSibling;
                if (panel.classList.contains("open")) {
                    panel.classList.remove("open");
                } else {
                    panel.classList.add("open");
                }
            });
        }
    };

    const launchCalculator = () => {
        const btn = document.querySelector(config.selectors.startBtn);
        const container = document.querySelector(config.selectors.appContainer);
        const iframe = document.querySelector(config.selectors.iframe);
        const intro = document.querySelector(config.selectors.intro);
        const wrapper = document.querySelector(config.selectors.wrapper);

        if (!btn || !container) return;

        trackEvent('start_calculator', 'Launch');

        if (intro) intro.style.display = "none";
        container.style.display = "block";
        if (wrapper) wrapper.classList.add('app-active');

        iframe.src = config.appUrl;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        btn.textContent = "Loading Calculator...";
        btn.disabled = true;
    };

    // --- 4. Event Binding ---

    const bindEvents = () => {
        const checkbox = document.querySelector(config.selectors.checkbox);
        const startBtn = document.querySelector(config.selectors.startBtn);
        const iframe = document.querySelector(config.selectors.iframe);

        if (checkbox && startBtn) {
            checkbox.addEventListener('change', (e) => {
                startBtn.disabled = !e.target.checked;
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', launchCalculator);
        }

        if (iframe) {
            iframe.addEventListener('load', () => {
                const loader = document.querySelector(config.selectors.loader);
                if (loader) {
                    setTimeout(() => {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.style.display = "none", 500);
                    }, 1000);
                }
            });
        }

        // Native Details/Summary FAQ Tracking
        document.addEventListener('toggle', (e) => {
            if (e.target.tagName === 'DETAILS' && e.target.open) {
                const summary = e.target.querySelector('summary');
                if (summary) trackEvent('faq_opened', summary.textContent);
            }
        }, true);
    };

    /**
     * Injects header and footer into the page.
     */
    const loadSharedComponents = async () => {
        const components = [
            { id: config.selectors.headerPlaceholder, file: '/assets/components/header.html' },
            { id: config.selectors.footerPlaceholder, file: '/assets/components/footer.html' }
        ];

        for (const item of components) {
            const el = document.querySelector(item.id);
            if (el) {
                try {
                    const response = await fetch(item.file);
                    if (!response.ok) throw new Error(`Could not find ${item.file}`);
                    
                    const html = await response.text();
                    el.innerHTML = html;

                    // --- COMPONENT LOADED HOOKS ---
                    
                    if (item.id === config.selectors.headerPlaceholder) {
                        highlightActiveLink();
                        // Note: initMobileMenu is now robust enough to be called once at Init, 
                        // but calling it here does no harm either.
                    }

                    if (item.id === config.selectors.footerPlaceholder) {
                        initDynamicYear();
                    }

                } catch (err) {
                    console.warn("Component load failed:", err);
                }
            }
        }
    };

    /**
     * Checks the URL and highlights the correct menu item
     */
    const highlightActiveLink = () => {
        const currentPath = window.location.pathname.replace(/\/$/, ""); 
        const navLinks = document.querySelectorAll('.nav-links');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href').replace(/\/$/, ""); 

            if (currentPath === linkHref || (currentPath === "" && linkHref === "")) {
                link.classList.add('active');
            } 
            else if (currentPath.includes("/learn") && linkHref.includes("/learn")) {
                link.classList.add('active');
            }
        });
    };
    
    // --- 5. Public Init ---
    return {
        init: function() {
            // We call initMobileMenu immediately. Because it uses Delegation,
            // it doesn't matter that the header hasn't loaded yet!
            initMobileMenu(); 
            
            loadSharedComponents();
            bindEvents();
            initFAQ();
        }
    };

})();

// Start App
document.addEventListener('DOMContentLoaded', GVMApp.init);
