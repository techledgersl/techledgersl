/**
 * Hero Slider JavaScript - Image slider functionality for hero section
 */

const HeroSlider = (function() {
    'use strict';

    let slider = null;
    let slides = [];
    let dots = [];
    let prevBtn = null;
    let nextBtn = null;
    let currentSlide = 0;
    let autoPlayInterval = null;
    let isInitialized = false;
    let scrollObserver = null;
    const AUTO_PLAY_DELAY = 5000; // 5 seconds

    /**
     * Initialize scroll animation for slider
     */
    function initScrollAnimation() {
        if (!slider) return;

        // Check if slider is already in viewport on load
        const rect = slider.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const isAlreadyVisible = rect.top < windowHeight * 0.9 && rect.bottom > 0;

        if (isAlreadyVisible) {
            // If already visible, show immediately with slight delay for smooth effect
            setTimeout(() => {
                slider.classList.add('hero__slider--visible');
            }, 300);
            return;
        }

        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        slider.classList.add('hero__slider--visible');
                        // Unobserve after animation to improve performance
                        scrollObserver.unobserve(slider);
                    }
                });
            }, {
                threshold: 0.2, // Trigger when 20% of slider is visible
                rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters viewport
            });

            scrollObserver.observe(slider);
        } else {
            // Fallback for browsers without IntersectionObserver
            function checkVisibility() {
                if (!slider) return;
                
                const rect = slider.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                
                if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
                    slider.classList.add('hero__slider--visible');
                    window.removeEventListener('scroll', checkVisibility);
                }
            }
            
            window.addEventListener('scroll', checkVisibility, { passive: true });
            checkVisibility(); // Check on load
        }
    }

    /**
     * Initialize the hero slider
     */
    function init() {
        if (isInitialized) return;

        slider = document.querySelector('.hero__slider');
        if (!slider) return;

        // Initialize scroll animation
        initScrollAnimation();

        slides = Array.from(slider.querySelectorAll('.hero__slider-slide'));
        dots = Array.from(slider.querySelectorAll('.hero__slider-dot'));
        prevBtn = slider.querySelector('.hero__slider-btn--prev');
        nextBtn = slider.querySelector('.hero__slider-btn--next');

        if (slides.length === 0) return;

        // Set up event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', goToPreviousSlide);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', goToNextSlide);
        }

        // Set up dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Keyboard navigation
        slider.addEventListener('keydown', handleKeyboardNavigation);

        // Click on slider container to advance to next slide
        const sliderContainer = slider.querySelector('.hero__slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('click', (e) => {
                // Don't advance if clicking on buttons or dots
                if (!e.target.closest('.hero__slider-btn') && !e.target.closest('.hero__slider-dot')) {
                    goToNextSlide();
                }
            });
        }

        // Pause autoplay on hover
        slider.addEventListener('mouseenter', pauseAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        // Start autoplay only if user doesn't prefer reduced motion
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            startAutoPlay();
            // Initialize scroll parallax effect
            initScrollParallax();
        }

        isInitialized = true;
    }

    /**
     * Initialize scroll parallax effect
     */
    function initScrollParallax() {
        if (!slider || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let ticking = false;
        const sliderContainer = slider.querySelector('.hero__slider-container');

        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = slider.getBoundingClientRect();
                    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                    const sliderHeight = rect.height;
                    
                    // Check if slider is in viewport
                    const isInViewport = rect.top < windowHeight && rect.bottom > 0;
                    
                    if (isInViewport && sliderContainer) {
                        // Calculate scroll progress (0 to 1)
                        const scrollProgress = Math.min(
                            Math.max((windowHeight - rect.top) / (windowHeight + sliderHeight), 0),
                            1
                        );
                        
                        // Apply subtle parallax effect (scale and translate)
                        const scale = 1 + (scrollProgress * 0.05); // Scale up to 1.05
                        const translateY = scrollProgress * -20; // Move up to 20px
                        
                        sliderContainer.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                        sliderContainer.style.transition = 'transform 0.1s ease-out';
                    } else if (sliderContainer) {
                        // Reset when out of viewport
                        sliderContainer.style.transform = 'scale(1) translateY(0)';
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        }

        // Listen to scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on load
    }

    /**
     * Go to a specific slide
     */
    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;

        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('hero__slider-slide--active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('hero__slider-dot--active');
        }

        // Update current slide index
        currentSlide = index;

        // Add active class to new slide and dot
        slides[currentSlide].classList.add('hero__slider-slide--active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('hero__slider-dot--active');
        }

        // Reset autoplay timer
        resetAutoPlay();
    }

    /**
     * Go to the next slide
     */
    function goToNextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
    }

    /**
     * Go to the previous slide
     */
    function goToPreviousSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyboardNavigation(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPreviousSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNextSlide();
        }
    }

    /**
     * Handle swipe gestures
     */
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - go to next slide
                goToNextSlide();
            } else {
                // Swipe right - go to previous slide
                goToPreviousSlide();
            }
        }
    }

    /**
     * Start autoplay
     */
    function startAutoPlay() {
        if (autoPlayInterval) return;
        autoPlayInterval = setInterval(goToNextSlide, AUTO_PLAY_DELAY);
    }

    /**
     * Pause autoplay
     */
    function pauseAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    /**
     * Reset autoplay timer
     */
    function resetAutoPlay() {
        pauseAutoPlay();
        startAutoPlay();
    }

    /**
     * Public API
     */
    return {
        init: init
    };

})();

