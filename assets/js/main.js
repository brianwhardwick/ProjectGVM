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



    // --- 2. Mobile Menu Logic (Moved Here) ---

    const initMobileMenu = () => {

        const toggleBtn = document.querySelector(config.selectors.navToggle);

        const navMenu = document.querySelector(config.selectors.navMenu);



        if (toggleBtn && navMenu) {

            // Toggle Click

            toggleBtn.addEventListener('click', () => {

                navMenu.classList.toggle('active');

                toggleBtn.classList.toggle('active');

            });



            // Close menu when a link is clicked

            const links = document.querySelectorAll(config.selectors.navLinks);

            links.forEach(link => {

                link.addEventListener('click', () => {

                    navMenu.classList.remove('active');

                    toggleBtn.classList.remove('active');

                });

            });

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
        // 1. Select Elements
        const btn = document.querySelector(config.selectors.startBtn);
        const container = document.querySelector(config.selectors.appContainer);
        const iframe = document.querySelector(config.selectors.iframe);
        const intro = document.querySelector(config.selectors.intro) || document.querySelector('.card') || document.querySelector('.seo-content');
        const wrapper = document.querySelector(config.selectors.wrapper);
        
        // --- THIS IS THE FIX ---
        // We select the header explicitly to hide it
        const header = document.querySelector('.main-header'); 
        const seoFooter = document.querySelector('.seo-footer');

        if (!btn || !container) return;

        trackEvent('start_calculator', 'Launch');

        // 2. Hide Static Content
        if (intro) intro.style.display = "none";
        if (seoFooter) seoFooter.style.display = 'none';

        // 3. Show App Container
        container.style.display = "block";

        // 4. Add 'app-active' to Wrapper (Triggers CSS for the card)
        if (wrapper) wrapper.classList.add('app-active');

        // 5. Add 'app-active' to Header (Triggers CSS to hide the H1 Title)
        if (header) {
            header.classList.add('app-active');
            header.style.display = 'none'; // Force hide via inline style as backup
        }

        // 6. Load App
        iframe.src = config.appUrl;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 7. Button Feedback
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

                        initMobileMenu(); // <--- FIXED: Init Menu AFTER injection

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

            loadSharedComponents();

            bindEvents();

            initFAQ(); // Initialize the custom FAQ script if it exists

        }

    };



})();






// Start App

document.addEventListener('DOMContentLoaded', GVMApp.init);