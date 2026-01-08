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
            intro: ".card-intro", // Card containing the start button
            wrapper: ".main-wrapper",
            faqDetails: ".faq-item details"
        }
    };

    // --- 2. Shared Component Loader (The "GitHub Pages Fix") ---
    
    /**
     * Injects header and footer into the page.
     * Uses path-prefixing to handle subfolder nesting.
     */
    const loadSharedComponents = async () => {
        const components = [
            { id: config.selectors.headerPlaceholder, file: 'header.html' },
            { id: config.selectors.footerPlaceholder, file: 'footer.html' }
        ];

        // Determine if we are in a subfolder (e.g., /about/)
        // GitHub Pages uses the path to define folders. 
        // If pathname has more than one segment, we likely need to go up a level.
        const pathSegments = window.location.pathname.split('/').filter(p => p && !p.includes('.html'));
        const pathPrefix = pathSegments.length > 0 ? '../' : './';

        for (const item of components) {
            const el = document.querySelector(item.id);
            if (el) {
                try {
                    const response = await fetch(pathPrefix + item.file);
                    if (!response.ok) throw new Error(`Could not find ${item.file}`);
                    const html = await response.text();
                    el.innerHTML = html;

                    // If we just loaded the footer, start the year script
                    if (item.id === config.selectors.footerPlaceholder) {
                        initDynamicYear();
                    }
                } catch (err) {
                    console.warn("Component load failed:", err);
                }
            }
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

    // *** Links Header & Footer *** //
    document.addEventListener("DOMContentLoaded", function() {
        // Function to load HTML components
        function loadComponent(elementId, componentPath) {
            const element = document.getElementById(elementId);
            if (element) {
                fetch(componentPath)
                    .then(response => {
                        if (!response.ok) throw new Error("Failed to load component");
                        return response.text();
                    })
                    .then(data => {
                        element.innerHTML = data;
                    })
                    .catch(error => console.error('Error loading component:', error));
            }
        }
    
        // Load the header and footer
        // Note: Adjust the paths if your folder structure differs
        loadComponent("header-placeholder", "/assets/components/header.html");
        loadComponent("footer-placeholder", "/assets/components/footer.html");
    });
    
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
