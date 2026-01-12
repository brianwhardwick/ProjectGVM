/**
 * Project GVM - Main Site Logic
 * Optimized for GitHub Pages (Shared Components & Calculator Launcher)
 */
const GVMApp = (function() {
    'use strict';

    document.getElementById("year").textContent = new Date().getFullYear();

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
            intro: ".card-intro", // Card containing the start button
            wrapper: ".main-wrapper",
            faqDetails: ".faq-item details"
        }
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


    // --- FAQ Plus Box
    document.addEventListener('DOMContentLoaded', function() {
        const acc = document.getElementsByClassName("faq-question");

        for (let i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                // Toggle the "active" class on the button
                this.classList.toggle("active");

                // Toggle the panel visibility
                const panel = this.nextElementSibling;
                if (panel.classList.contains("open")) {
                    panel.classList.remove("open");
                } else {
                    panel.classList.add("open");
                }
            });
        }
    });

    const launchCalculator = () => {
        const btn = document.querySelector(config.selectors.startBtn);
        const container = document.querySelector(config.selectors.appContainer);
        const iframe = document.querySelector(config.selectors.iframe);
        const intro = document.querySelector(config.selectors.intro);
        const wrapper = document.querySelector(config.selectors.wrapper);

        if (!btn || !container) return;

        trackEvent('start_calculator', 'Launch');

        // Swap UI visibility
        if (intro) intro.style.display = "none";
        container.style.display = "block";
        if (wrapper) wrapper.classList.add('app-active');

        // Set iframe source to trigger loading
        iframe.src = config.appUrl;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        btn.textContent = "Loading Calculator...";
        btn.disabled = true;
    };

    // --- 4. Event Binding ---

    const bindEvents = () => {
        // We use Event Delegation for elements that might be injected (like nav)
        // and direct binding for page-specific elements.

        const checkbox = document.querySelector(config.selectors.checkbox);
        const startBtn = document.querySelector(config.selectors.startBtn);
        const iframe = document.querySelector(config.selectors.iframe);

        // Disclaimer Checkbox
        if (checkbox && startBtn) {
            checkbox.addEventListener('change', (e) => {
                startBtn.disabled = !e.target.checked;
            });
        }

        // Start Button
        if (startBtn) {
            startBtn.addEventListener('click', launchCalculator);
        }

        // Iframe Loading Spinner
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

        // FAQ Toggle Tracking
        document.addEventListener('toggle', (e) => {
            if (e.target.tagName === 'DETAILS' && e.target.open) {
                const summary = e.target.querySelector('summary');
                if (summary) trackEvent('faq_opened', summary.textContent);
            }
        }, true);
    };

    /**
     * Injects header and footer into the page.
     * Uses absolute paths to ensure they load from any subfolder.
     */
    const loadSharedComponents = async () => {
        // FIXED: Added full paths to the assets folder
        const components = [
            { id: config.selectors.headerPlaceholder, file: '/assets/components/header.html' },
            { id: config.selectors.footerPlaceholder, file: '/assets/components/footer.html' }
        ];

        for (const item of components) {
            const el = document.querySelector(item.id);
            if (el) {
                try {
                    // Removed complex relative path logic in favor of absolute paths
                    const response = await fetch(item.file);
                    
                    if (!response.ok) throw new Error(`Could not find ${item.file}`);
                    const html = await response.text();
                    el.innerHTML = html;

                    // 1. If we just loaded the header, highlight the active link
                    if (item.id === config.selectors.headerPlaceholder) {
                        highlightActiveLink();
                    }

                    // 2. If we just loaded the footer, start the year script
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
        const currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize: remove trailing slash
        const navLinks = document.querySelectorAll('.nav-links');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href').replace(/\/$/, ""); 

            // Logic 1: Exact Match (e.g., Home, Calculator, About)
            if (currentPath === linkHref || (currentPath === "" && linkHref === "")) {
                link.classList.add('active');
            } 
            // Logic 2: "Learn" Section Handling
            else if (currentPath.includes("/learn") && linkHref.includes("/learn")) {
                link.classList.add('active');
            }
        });
    };
    
    // --- 5. Public Init ---
    return {
        init: function() {
            // 1. Injected Shared HTML
            loadSharedComponents();
            
            // 2. Setup Page Logic
            bindEvents();
        }
    };

})();

// Start App
document.addEventListener('DOMContentLoaded', GVMApp.init);

