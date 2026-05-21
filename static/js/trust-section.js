/**
 * Trust Section JavaScript - Scroll hover effect for trust section
 */

(function() {
    'use strict';

    let trustSection = null;
    let isInitialized = false;
    let ticking = false;

    /**
     * Initialize scroll hover effect for trust section
     */
    function init() {
        if (isInitialized) return;

        trustSection = document.querySelector('.trust-section');
        if (!trustSection) return;

        // Check on load
        handleScroll();

        // Listen to scroll events with requestAnimationFrame
        window.addEventListener('scroll', handleScrollEvent, { passive: true });

        isInitialized = true;
    }

    /**
     * Handle scroll event with throttling
     */
    function handleScrollEvent() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    /**
     * Apply scroll-based hover effect
     */
    function handleScroll() {
        if (!trustSection) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const rect = trustSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const currentScrollY = window.scrollY;

        // Check if element is in viewport
        const isInViewport = (
            rect.top < windowHeight * 1.2 &&
            rect.bottom > -windowHeight * 0.2
        );

        if (isInViewport) {
            // Calculate scroll progress based on element's position in viewport
            const elementTop = rect.top + currentScrollY;
            const elementCenter = elementTop + (rect.height / 2);
            const viewportCenter = currentScrollY + (windowHeight / 2);
            
            // Calculate distance from viewport center (0 when centered, increases as it moves away)
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
            const maxDistance = windowHeight;
            const scrollProgress = Math.min(distanceFromCenter / maxDistance, 1);

            // Apply subtle scale effect (scale up when centered, scale down when away)
            const scale = 1 + ((1 - scrollProgress) * 0.03); // Scale up to 1.03 when centered
            trustSection.style.transform = `scale(${scale})`;
            trustSection.classList.add('scrolled');

            // Apply parallax effect to background position
            const parallaxOffset = (viewportCenter - elementCenter) * 0.1; // Subtle parallax
            trustSection.style.backgroundPosition = `center ${parallaxOffset}px`;
        } else {
            // Reset when out of viewport
            trustSection.style.transform = '';
            trustSection.style.backgroundPosition = 'center';
            
            if (rect.bottom < 0 || rect.top > windowHeight) {
                trustSection.classList.remove('scrolled');
            }
        }
    }

    // Public API
    window.TrustSection = {
        init: init
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

