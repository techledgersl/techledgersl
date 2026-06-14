/**
 * Navigation JavaScript - Mobile menu toggle, smooth scrolling, active link highlighting
 */

const Navigation = (function() {
    'use strict';

    let navbarToggle;
    let navbarMenu;
    let navbarLinks;
    let dropdownToggles;
    let dropdownParents;
    let isMenuOpen = false;

    /**
     * Initialize navigation functionality
     */
    function init() {
        navbarToggle = document.querySelector('.navbar__toggle');
        navbarMenu = document.querySelector('.navbar__menu');
        navbarLinks = document.querySelectorAll('.navbar__link');
        dropdownToggles = document.querySelectorAll('.navbar__dropdown-toggle');
        dropdownParents = document.querySelectorAll('.navbar__item--has-dropdown');

        if (navbarToggle) {
            navbarToggle.addEventListener('click', toggleMenu);
        }

        // Close menu when clicking outside
        document.addEventListener('click', handleOutsideClick);

        // Close menu on window resize
        window.addEventListener('resize', handleResize);

        // Initialize smooth scrolling for anchor links
        initSmoothScroll();

        // Initialize active link highlighting and close menu on link click
        initActiveLink();

        // Initialize About dropdown behavior
        initDropdowns();

        // Initialize scroll effect for sticky header
        initScrollEffect();
    }

    /**
     * Initialize scroll effect for sticky header
     */
    function initScrollEffect() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        const scrollThreshold = 5;
        let ticking = false;

        function handleScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    if (currentScrollY > scrollThreshold) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });

                ticking = true;
            }
        }

        // Use requestAnimationFrame for smooth scroll handling
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Check initial state
        handleScroll();
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (navbarMenu) {
            navbarMenu.classList.toggle('active', isMenuOpen);
        }

        if (navbarToggle) {
            navbarToggle.setAttribute('aria-expanded', isMenuOpen);
        }

        // Prevent body scroll when menu is open
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            // Focus first menu item for keyboard navigation
            const firstLink = navbarMenu.querySelector('.navbar__link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }

    /**
     * Handle clicks outside the menu
     */
    function handleOutsideClick(event) {
        if (!isMenuOpen) return;

        const target = event.target;
        const isClickInsideMenu = navbarMenu && navbarMenu.contains(target);
        const isClickOnToggle = navbarToggle && navbarToggle.contains(target);

        if (!isClickInsideMenu && !isClickOnToggle) {
            closeMenu();
        }
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        isMenuOpen = false;
        
        if (navbarMenu) {
            navbarMenu.classList.remove('active');
        }

        if (navbarToggle) {
            navbarToggle.setAttribute('aria-expanded', 'false');
        }

        closeAllDropdowns();

        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        // Return focus to toggle button
        if (navbarToggle) {
            navbarToggle.focus();
        }
    }

    /**
     * Close all dropdown menus
     */
    function closeAllDropdowns() {
        if (!dropdownParents || !dropdownParents.length) return;

        dropdownParents.forEach(item => item.classList.remove('is-open'));
        dropdownToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    }

    /**
     * Initialize desktop/mobile dropdown behavior
     */
    function initDropdowns() {
        if (!dropdownToggles || !dropdownToggles.length) return;

        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                const parentItem = this.closest('.navbar__item--has-dropdown');
                if (!parentItem) return;

                const isOpen = parentItem.classList.contains('is-open');

                closeAllDropdowns();

                if (!isOpen) {
                    parentItem.classList.add('is-open');
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeAllDropdowns();
            }
        });

        document.addEventListener('click', function(event) {
            const clickedInsideDropdown = event.target.closest('.navbar__item--has-dropdown');
            if (!clickedInsideDropdown) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close menu on resize to desktop
        if (window.innerWidth > 767 && isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    if (isMenuOpen) {
                        closeMenu();
                    }

                    // Calculate offset for sticky header
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize active link highlighting based on current page
     */
    function initActiveLink() {
        const currentPath = window.location.pathname;

        navbarLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isDropdownToggle = link.classList.contains('navbar__dropdown-toggle');

            // Only anchor links have a resolvable URL; the dropdown toggle is a
            // <button> without an href, so guard before parsing to avoid throwing.
            if (href) {
                const linkPath = new URL(link.href, window.location.origin).pathname;

                if (linkPath === currentPath ||
                    (currentPath.startsWith(linkPath) && linkPath !== '/')) {
                    link.classList.add('active');
                }
            }

            // Close the mobile menu when navigating. The dropdown toggle manages
            // its own open/close behaviour, so leave it to initDropdowns().
            if (!isDropdownToggle) {
                link.addEventListener('click', function() {
                    closeAllDropdowns();
                    if (isMenuOpen) {
                        closeMenu();
                    }
                });
            }
        });
    }

    // Public API
    return {
        init: init,
        closeMenu: closeMenu
    };

})();

