/**
 * Integrations Section Scroll Effects JavaScript - Scroll animations and interactions for integrations section
 */

const IntegrationsScroll = (function() {
    'use strict';

    let integrationsSection = null;
    let integrationsText = null;
    let integrationsVisual = null;
    let integrationsCircle = null;
    let isInitialized = false;
    let textObserver = null;
    let visualObserver = null;

    /**
     * Initialize scroll animations for text and visual containers
     */
    function initScrollAnimations() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            // Observer for integrations text
            if (integrationsText) {
                textObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            integrationsText.classList.add('integrations__text--visible');
                            textObserver.unobserve(integrationsText);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                textObserver.observe(integrationsText);
            }

            // Observer for integrations visual
            if (integrationsVisual) {
                visualObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            integrationsVisual.classList.add('integrations__visual--visible');
                            // Start circle animation after a short delay
                            setTimeout(() => {
                                if (integrationsCircle) {
                                    integrationsCircle.classList.add('integrations__circle--animate');
                                }
                            }, 300);
                            visualObserver.unobserve(integrationsVisual);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                visualObserver.observe(integrationsVisual);
            }
        } else {
            // Fallback for browsers without IntersectionObserver
            function checkVisibility() {
                if (!integrationsSection) return;
                
                const rect = integrationsSection.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const isInViewport = rect.top < windowHeight * 0.9 && rect.bottom > 0;
                
                if (isInViewport) {
                    if (integrationsText) {
                        integrationsText.classList.add('integrations__text--visible');
                    }
                    if (integrationsVisual) {
                        integrationsVisual.classList.add('integrations__visual--visible');
                        setTimeout(() => {
                            if (integrationsCircle) {
                                integrationsCircle.classList.add('integrations__circle--animate');
                            }
                        }, 300);
                    }
                    window.removeEventListener('scroll', checkVisibility);
                }
            }
            
            window.addEventListener('scroll', checkVisibility, { passive: true });
            checkVisibility(); // Check on load
        }
    }

    /**
     * Initialize the integrations scroll effects
     */
    function init() {
        if (isInitialized) return;

        integrationsSection = document.querySelector('.integrations-section');
        if (!integrationsSection) return;

        integrationsText = integrationsSection.querySelector('.integrations__text');
        integrationsVisual = integrationsSection.querySelector('.integrations__visual');
        integrationsCircle = integrationsSection.querySelector('.integrations__circle');

        // Initialize scroll animations
        initScrollAnimations();

        isInitialized = true;
    }

    // Public API
    return {
        init: init
    };

})();

