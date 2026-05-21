/**
 * Main JavaScript - Core functionality, DOM ready handlers, utility functions
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize all modules
        initializeModules();
    });

    /**
     * Initialize all JavaScript modules
     */
    function initializeModules() {
        // Check if navigation module exists and initialize
        if (typeof Navigation !== 'undefined') {
            Navigation.init();
        }

        // Check if animations module exists and initialize
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }

        // Check if ContactForm module exists and initialize
        if (typeof ContactForm !== 'undefined') {
            ContactForm.init();
        }

        // Check if HeroTrust module exists and initialize
        if (typeof HeroTrust !== 'undefined') {
            HeroTrust.init();
        }

        // Check if TrustSection module exists and initialize
        if (typeof TrustSection !== 'undefined') {
            TrustSection.init();
        }

        // Check if ServicesOverview module exists and initialize
        if (typeof ServicesOverview !== 'undefined') {
            ServicesOverview.init();
        }

        // Check if HeroSlider module exists and initialize
        if (typeof HeroSlider !== 'undefined') {
            HeroSlider.init();
        }

        // Check if BenefitsScroll module exists and initialize
        if (typeof BenefitsScroll !== 'undefined') {
            BenefitsScroll.init();
        }

        // Check if IntegrationsCircle module exists and initialize
        if (typeof IntegrationsCircle !== 'undefined') {
            IntegrationsCircle.init();
        }

        // Check if IntegrationsScroll module exists and initialize
        if (typeof IntegrationsScroll !== 'undefined') {
            IntegrationsScroll.init();
        }

        // Check if CtaScroll module exists and initialize
        if (typeof CtaScroll !== 'undefined') {
            CtaScroll.init();
        }

        // Check if PageTransitions module exists and initialize
        if (typeof PageTransitions !== 'undefined') {
            PageTransitions.init();
            // Restore scroll position if available
            PageTransitions.restoreScrollPosition();
        }
    }

    /**
     * Utility function to debounce function calls
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility function to check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Export utility functions to global scope if needed
    window.utils = {
        debounce: debounce,
        isInViewport: isInViewport
    };

})();

