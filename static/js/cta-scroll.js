/**
 * CTA Section Scroll Effects JavaScript - Scroll animations for CTA section
 */

const CtaScroll = (function() {
    'use strict';

    let ctaSections = [];
    let isInitialized = false;
    let ticking = false;

    /**
     * Initialize scroll animations for a single CTA section
     */
    function initScrollAnimations(ctaSection) {
        const ctaTitle = ctaSection.querySelector('.section-title');
        const ctaDescription = ctaSection.querySelector('.cta-section__description');
        const ctaActions = ctaSection.querySelector('.cta-section__actions');

        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            // Observer for CTA title
            if (ctaTitle) {
                const titleObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            ctaTitle.style.opacity = '1';
                            ctaTitle.style.transform = 'translateY(0)';
                            titleObserver.unobserve(ctaTitle);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                titleObserver.observe(ctaTitle);
            }

            // Observer for CTA description
            if (ctaDescription) {
                const descObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                ctaDescription.style.opacity = '1';
                                ctaDescription.style.transform = 'translateY(0)';
                            }, 150);
                            descObserver.unobserve(ctaDescription);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                descObserver.observe(ctaDescription);
            }

            // Observer for CTA actions
            if (ctaActions) {
                const actionsObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                ctaActions.style.opacity = '1';
                                ctaActions.style.transform = 'translateY(0)';
                            }, 300);
                            actionsObserver.unobserve(ctaActions);
                        }
                    });
                }, {
                    threshold: 0.2,
                    rootMargin: '0px 0px -50px 0px'
                });
                actionsObserver.observe(ctaActions);
            }
        } else {
            // Fallback for browsers without IntersectionObserver
            const checkVisibility = () => {
                const rect = ctaSection.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                
                if (rect.top < windowHeight * 0.9 && rect.bottom > -50) {
                    if (ctaTitle) {
                        ctaTitle.style.opacity = '1';
                        ctaTitle.style.transform = 'translateY(0)';
                    }
                    if (ctaDescription) {
                        setTimeout(() => {
                            ctaDescription.style.opacity = '1';
                            ctaDescription.style.transform = 'translateY(0)';
                        }, 150);
                    }
                    if (ctaActions) {
                        setTimeout(() => {
                            ctaActions.style.opacity = '1';
                            ctaActions.style.transform = 'translateY(0)';
                        }, 300);
                    }
                    window.removeEventListener('scroll', checkVisibility);
                }
            };
            
            window.addEventListener('scroll', checkVisibility, { passive: true });
            checkVisibility();
        }
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
     * Apply scroll-based parallax effect
     */
    function handleScroll() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const windowHeight = window.innerHeight;
        const currentScrollY = window.scrollY;

        // Process all CTA sections
        ctaSections.forEach(ctaSection => {
            const rect = ctaSection.getBoundingClientRect();

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

                // Apply subtle scale effect (scale up when centered)
                const scale = 1 + ((1 - scrollProgress) * 0.02); // Scale up to 1.02 when centered
                ctaSection.style.transform = `scale(${scale})`;
                ctaSection.classList.add('cta-section--scrolled');
            } else {
                // Reset when out of viewport
                ctaSection.style.transform = '';
                
                if (rect.bottom < 0 || rect.top > windowHeight) {
                    ctaSection.classList.remove('cta-section--scrolled');
                }
            }
        });
    }

    /**
     * Initialize the CTA scroll effects
     */
    function init() {
        if (isInitialized) return;

        // Find all CTA section elements
        ctaSections = Array.from(document.querySelectorAll('.cta-section'));
        if (ctaSections.length === 0) {
            return; // Exit if no CTA sections exist
        }

        // Initialize each CTA section
        ctaSections.forEach(ctaSection => {
            const ctaTitle = ctaSection.querySelector('.section-title');
            const ctaDescription = ctaSection.querySelector('.cta-section__description');
            const ctaActions = ctaSection.querySelector('.cta-section__actions');

            // Initially hide and position elements for animation
            if (ctaTitle) {
                ctaTitle.style.opacity = '0';
                ctaTitle.style.transform = 'translateY(30px)';
                ctaTitle.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            }

            if (ctaDescription) {
                ctaDescription.style.opacity = '0';
                ctaDescription.style.transform = 'translateY(30px)';
                ctaDescription.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            }

            if (ctaActions) {
                ctaActions.style.opacity = '0';
                ctaActions.style.transform = 'translateY(30px)';
                ctaActions.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            }

            // Initialize scroll animations for text and visual containers
            initScrollAnimations(ctaSection);
        });

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            // Listen to scroll events with requestAnimationFrame
            window.addEventListener('scroll', handleScrollEvent, { passive: true });
            handleScroll(); // Check on load
        }

        isInitialized = true;
    }

    // Public API
    return {
        init: init
    };

})();

