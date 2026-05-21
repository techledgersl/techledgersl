/**
 * Hero Trust Section JavaScript - Scroll hover effect for trust section
 */

(function() {
    'use strict';

    let trustSection = null;
    let isInitialized = false;
    let lastScrollY = 0;
    let ticking = false;

    /**
     * Initialize scroll hover effect for trust section
     */
    function init() {
        if (isInitialized) return;

        trustSection = document.querySelector('.hero__trust');
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

        const rect = trustSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const currentScrollY = window.scrollY;

        // Check if element is in viewport
        const isInViewport = (
            rect.top < windowHeight &&
            rect.bottom > 0
        );

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            return; // Skip scroll effects if user prefers reduced motion
        }

        if (isInViewport) {
            // Calculate scroll progress (0 to 1)
            const elementTop = rect.top + currentScrollY;
            const elementCenter = elementTop + (rect.height / 2);
            const scrollProgress = Math.min(
                Math.max((currentScrollY + windowHeight - elementCenter) / windowHeight, 0),
                1
            );

            // Apply transform based on scroll position (only after initial animation)
            // Check if animation has completed by checking opacity
            const computedStyle = window.getComputedStyle(trustSection);
            const opacity = parseFloat(computedStyle.opacity);
            
            if (opacity >= 1) {
                // Animation has completed, now apply scroll effects
                const scale = 1 + (scrollProgress * 0.03); // Subtle scale up to 1.03
                trustSection.style.transform = `scale(${scale})`;
                trustSection.classList.add('scrolled');

                // Adjust background position for parallax effect
                const parallaxOffset = scrollProgress * 20; // Max 20px movement
                trustSection.style.backgroundPosition = `center ${parallaxOffset}px`;
            }
        } else {
            // Reset when out of viewport (only if animation has completed)
            const computedStyle = window.getComputedStyle(trustSection);
            const opacity = parseFloat(computedStyle.opacity);
            
            if (opacity >= 1) {
                trustSection.style.transform = '';
                trustSection.style.backgroundPosition = 'center';
            }
            
            if (rect.bottom < 0 || rect.top > windowHeight) {
                trustSection.classList.remove('scrolled');
            }
        }

        lastScrollY = currentScrollY;
    }

    // Public API
    window.HeroTrust = {
        init: init
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

