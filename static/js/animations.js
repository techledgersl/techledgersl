/**
 * Scroll-Reveal Animations
 *
 * Automatically finds elements across every page, marks them with the
 * .js-reveal class (+ a data-reveal direction), then uses IntersectionObserver
 * to add .is-visible when they scroll into view.
 *
 * Grid items (.service-card, team cards, etc.) are staggered so each card
 * flies in a little after the previous one.
 *
 * CSS in main.css handles the actual opacity / transform transitions.
 */

const Animations = (function () {
    'use strict';

    /* ── Element map ─────────────────────────────────────────────
       Each entry defines:
         selector   – what to find
         reveal     – animation direction  (up | left | right | scale | fade)
         stagger    – ms added per sibling inside the same parent grid
         baseDelay  – fixed ms offset before the stagger starts
    ──────────────────────────────────────────────────────────── */
    var TARGETS = [
        /* Eye-brow labels / chips */
        {
            selector   : '.services-section__eyebrow, .about-chip, .about-section-kicker, .portfolio-chip',
            reveal     : 'fade',
            baseDelay  : 0,
            stagger    : 0
        },
        /* Page / section titles */
        {
            selector   : '.services-section__title, .about-hero__title, .about-section-title, ' +
                         '.services-cta__title, .about-cta h2',
            reveal     : 'up',
            baseDelay  : 80,
            stagger    : 0
        },
        /* Subtitles / descriptions */
        {
            selector   : '.services-section__subtitle, .about-hero__subtitle, ' +
                         '.services-cta__description, .about-cta p',
            reveal     : 'up',
            baseDelay  : 160,
            stagger    : 0
        },
        /* CTA action buttons row */
        {
            selector   : '.services-cta__actions, .about-cta__actions, .about-hero__actions',
            reveal     : 'up',
            baseDelay  : 240,
            stagger    : 0
        },
        /* Metric / hero stat blocks */
        {
            selector   : '.about-hero__metrics, .about-hero-metric',
            reveal     : 'up',
            baseDelay  : 200,
            stagger    : 80
        },
        /* Service / portfolio cards — staggered per grid */
        {
            selector   : '.service-card',
            reveal     : 'up',
            baseDelay  : 0,
            stagger    : 90
        },
        /* About page cards */
        {
            selector   : '.about-value-card, .about-framework-card, .about-stat-card, .about-partner-card',
            reveal     : 'up',
            baseDelay  : 0,
            stagger    : 80
        },
        /* Team cards — slight scale-up + fade */
        {
            selector   : '.about-team-card',
            reveal     : 'scale',
            baseDelay  : 0,
            stagger    : 110
        },
        /* Identity / story blocks */
        {
            selector   : '.about-story__content',
            reveal     : 'left',
            baseDelay  : 0,
            stagger    : 0
        },
        {
            selector   : '.about-story__aside',
            reveal     : 'right',
            baseDelay  : 0,
            stagger    : 0
        },
        /* Generic cards from home / other sections */
        {
            selector   : '.metric-card, .process-card, .benefit-item, .blog-card, .pricing-card',
            reveal     : 'up',
            baseDelay  : 0,
            stagger    : 80
        }
    ];

    /* ── State ───────────────────────────────────────────────── */
    var observer = null;
    var isInitialized = false;

    /* ── Helpers ─────────────────────────────────────────────── */

    /**
     * Mark a single element for reveal, set its delay, then observe it.
     */
    function markElement(el, direction, delay) {
        if (el.dataset.revealReady) return;   // already processed
        el.dataset.revealReady = '1';

        el.classList.add('js-reveal');
        el.setAttribute('data-reveal', direction);

        if (delay) {
            el.style.transitionDelay = delay + 'ms';
        }

        // Clear delay once visible so hover transitions aren't delayed
        el.addEventListener('transitionend', function clearDelay() {
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', clearDelay);
        }, { once: true });

        observer.observe(el);
    }

    /**
     * Process a group of sibling elements with optional stagger.
     * When stagger > 0, each element inside the same parent grid
     * gets an increasing delay.
     */
    function processGroup(elements, direction, baseDelay, stagger) {
        // Group by parent so stagger resets per grid
        var groups = new Map();

        elements.forEach(function (el) {
            // Skip elements already inside another observed card
            // (avoids double-animating nested children)
            if (el.closest('[data-reveal-ready]')) return;

            var parent = el.parentElement || document.body;
            if (!groups.has(parent)) groups.set(parent, []);
            groups.get(parent).push(el);
        });

        groups.forEach(function (siblings) {
            siblings.forEach(function (el, i) {
                var delay = baseDelay + (stagger > 0 ? i * stagger : 0);
                markElement(el, direction, delay);
            });
        });
    }

    /* ── IntersectionObserver callback ───────────────────────── */
    function onIntersect(entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }

    /* ── Init ────────────────────────────────────────────────── */
    function init() {
        if (isInitialized) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        isInitialized = true;

        observer = new IntersectionObserver(onIntersect, {
            threshold  : 0.12,
            rootMargin : '0px 0px -48px 0px'
        });

        TARGETS.forEach(function (target) {
            var elements = Array.from(document.querySelectorAll(target.selector));
            if (!elements.length) return;
            processGroup(elements, target.reveal, target.baseDelay, target.stagger);
        });
    }

    return { init: init };

})();
