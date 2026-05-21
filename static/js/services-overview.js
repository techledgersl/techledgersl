/**
 * Services Overview Section JavaScript - Scroll zoom-in effect for services overview section
 */

(function() {
    'use strict';

    let servicesOverview = null;
    let isInitialized = false;
    let ticking = false;

    /**
     * Initialize scroll zoom-in effect for services overview section
     */
    function init() {
        if (isInitialized) return;

        servicesOverview = document.querySelector('.services-overview');
        if (!servicesOverview) return;

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
     * Apply scroll-based zoom-in effect
     */
    function handleScroll() {
        if (!servicesOverview) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const rect = servicesOverview.getBoundingClientRect();
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

            // Apply zoom-in effect (scale up when centered, scale down when away)
            const scale = 1 + ((1 - scrollProgress) * 0.05); // Scale up to 1.05 when centered (zoom in)
            servicesOverview.style.transform = `scale(${scale})`;
            servicesOverview.classList.add('scrolled');

            // Apply parallax effect to background position for zoom effect
            const parallaxOffset = (viewportCenter - elementCenter) * 0.15; // Subtle parallax
            servicesOverview.style.backgroundPosition = `center ${parallaxOffset}px`;
        } else {
            // Reset when out of viewport
            servicesOverview.style.transform = '';
            servicesOverview.style.backgroundPosition = 'center';
            
            if (rect.bottom < 0 || rect.top > windowHeight) {
                servicesOverview.classList.remove('scrolled');
            }
        }
    }

    // Public API
    window.ServicesOverview = {
        init: init
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

