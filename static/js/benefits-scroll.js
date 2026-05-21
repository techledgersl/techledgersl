/**
 * Benefits Section Scroll Effects JavaScript - Parallax and scroll animations for benefits section
 */

const BenefitsScroll = (function() {
    'use strict';

    let benefitsSection = null;
    let benefitsText = null;
    let benefitsVisual = null;
    let benefitsChartImage = null;
    let isInitialized = false;
    let ticking = false;
    let textObserver = null;
    let visualObserver = null;

    /**
     * Initialize scroll animations for text and visual containers
     */
    function initScrollAnimations() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            // Observer for benefits text
            if (benefitsText) {
                textObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            benefitsText.style.opacity = '1';
                            benefitsText.style.transform = 'translateX(0)';
                            textObserver.unobserve(benefitsText);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                textObserver.observe(benefitsText);
            }

            // Observer for benefits visual
            if (benefitsVisual) {
                visualObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            benefitsVisual.style.opacity = '1';
                            benefitsVisual.style.transform = 'translateX(0)';
                            visualObserver.unobserve(benefitsVisual);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                visualObserver.observe(benefitsVisual);
            }
        } else {
            // Fallback for browsers without IntersectionObserver
            function checkVisibility() {
                if (!benefitsSection) return;
                
                const rect = benefitsSection.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const isInViewport = rect.top < windowHeight * 0.9 && rect.bottom > 0;
                
                if (isInViewport) {
                    if (benefitsText) {
                        benefitsText.style.opacity = '1';
                        benefitsText.style.transform = 'translateX(0)';
                    }
                    if (benefitsVisual) {
                        benefitsVisual.style.opacity = '1';
                        benefitsVisual.style.transform = 'translateX(0)';
                    }
                    window.removeEventListener('scroll', checkVisibility);
                }
            }
            
            window.addEventListener('scroll', checkVisibility, { passive: true });
            checkVisibility(); // Check on load
        }
    }

    /**
     * Handle scroll event with throttling
     */
    function handleScrollEvent() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    /**
     * Apply parallax effect to benefits chart image
     */
    function handleParallax() {
        if (!benefitsSection || !benefitsChartImage) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const rect = benefitsSection.getBoundingClientRect();
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

            // Apply scale effect (subtle zoom when centered)
            const scale = 1 + ((1 - scrollProgress) * 0.03); // Scale up to 1.03 when centered
            benefitsChartImage.style.transform = `scale(${scale})`;
            
            // Apply subtle translate effect for depth perception
            const translateY = (viewportCenter - elementCenter) * 0.1; // Subtle vertical movement
            benefitsChartImage.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            
            benefitsSection.classList.add('benefits-section--scrolled');
        } else {
            // Reset when out of viewport
            benefitsChartImage.style.transform = '';
            
            if (rect.bottom < 0 || rect.top > windowHeight) {
                benefitsSection.classList.remove('benefits-section--scrolled');
            }
        }
    }

    /**
     * Initialize the benefits scroll effects
     */
    function init() {
        if (isInitialized) return;

        benefitsSection = document.querySelector('.benefits-section');
        if (!benefitsSection) return;

        benefitsText = benefitsSection.querySelector('.benefits__text');
        benefitsVisual = benefitsSection.querySelector('.benefits__visual');
        benefitsChartImage = benefitsSection.querySelector('.benefits__chart-image');

        // Initialize scroll animations for text and visual containers
        initScrollAnimations();

        // Initialize parallax effect for chart image
        if (benefitsChartImage) {
            // Check on load
            handleParallax();
            
            // Listen to scroll events with requestAnimationFrame
            window.addEventListener('scroll', handleScrollEvent, { passive: true });
        }

        isInitialized = true;
    }

    // Public API
    return {
        init: init
    };

})();

