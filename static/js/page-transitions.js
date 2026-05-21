/**
 * Page Transitions — Curtain Wipe with Logo Loader
 *
 * EXIT  → branded overlay sweeps UP from the bottom; logo fades in once the
 *         veil covers the screen, giving a "loading" feel.
 * ENTER → veil already covers the new page; logo is visible; veil sweeps UP
 *         away from the top while logo fades out halfway through.
 *
 * The logo element (#page-veil-icon) is positioned fixed and independent of
 * the veil's scaleY transform so it never distorts during the wipe.
 */

const PageTransitions = (function () {
    'use strict';

    /* ── Timing ─────────────────────────────────────────────────── */
    const DURATION_EXIT   = 460;   // ms — veil sweeps IN  (page leaving)
    const DURATION_ENTER  = 680;   // ms — veil sweeps OUT (page entering)
    const EASE_SHARP  = 'cubic-bezier(0.76, 0, 0.24, 1)';
    const EASE_SMOOTH = 'cubic-bezier(0.22, 1, 0.36, 1)';

    let veil     = null;
    let iconWrap = null;
    let isNavigating = false;

    /* ── Build overlay + icon elements ─────────────────────────── */
    function buildElements() {
        /* Gradient curtain */
        veil = document.getElementById('page-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.id = 'page-veil';
            document.body.appendChild(veil);
        }

        /* Logo wrapper — fixed, above the veil, won't distort */
        iconWrap = document.getElementById('page-veil-icon');
        if (!iconWrap) {
            var iconUrl = document.body.getAttribute('data-icon-url') || '';
            iconWrap = document.createElement('div');
            iconWrap.id = 'page-veil-icon';

            if (iconUrl) {
                var img = document.createElement('img');
                img.src = iconUrl;
                img.alt = 'TechLedger Solutions';
                img.width = 72;
                img.height = 72;
                iconWrap.appendChild(img);
            }

            document.body.appendChild(iconWrap);
        }
    }

    /* ── Show / hide the logo ───────────────────────────────────── */
    function showIcon() {
        iconWrap.classList.add('is-visible');
    }

    function hideIcon(delay) {
        setTimeout(function () {
            iconWrap.classList.remove('is-visible');
        }, delay || 0);
    }

    /* ── ENTER: veil sweeps away upward, logo fades mid-way ─────── */
    function revealPage() {
        /* Veil starts fully covering the screen (from top edge) */
        veil.style.transition      = 'none';
        veil.style.transformOrigin = 'top center';
        veil.style.transform       = 'scaleY(1)';

        /* Logo is visible as the new page loads */
        showIcon();

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                /* Sweep veil away */
                veil.style.transition = 'transform ' + DURATION_ENTER + 'ms ' + EASE_SMOOTH;
                veil.style.transform  = 'scaleY(0)';

                /* Fade logo out when veil is ~halfway gone */
                hideIcon(Math.round(DURATION_ENTER * 0.4));
            });
        });
    }

    /* ── EXIT: veil sweeps in from bottom, logo appears mid-way ─── */
    function hidePage(callback) {
        isNavigating = true;

        /* Veil starts hidden at the bottom */
        veil.style.transition      = 'none';
        veil.style.transformOrigin = 'bottom center';
        veil.style.transform       = 'scaleY(0)';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                /* Sweep veil in */
                veil.style.transition = 'transform ' + DURATION_EXIT + 'ms ' + EASE_SHARP;
                veil.style.transform  = 'scaleY(1)';

                /* Show logo once veil is ~halfway across */
                setTimeout(showIcon, Math.round(DURATION_EXIT * 0.5));

                /* Navigate after veil fully covers */
                setTimeout(callback, DURATION_EXIT);
            });
        });
    }

    /* ── Intercept internal link clicks ─────────────────────────── */
    function attachLinkHandlers() {
        document.addEventListener('click', function (e) {
            if (isNavigating) return;

            var link = e.target.closest('a[href]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (!href) return;

            if (
                href.charAt(0) === '#'            ||
                href.indexOf('mailto:') === 0     ||
                href.indexOf('tel:')    === 0     ||
                link.hasAttribute('download')     ||
                link.getAttribute('target') === '_blank'
            ) return;

            var destination;
            try {
                var url = new URL(href, window.location.origin);
                if (url.origin !== window.location.origin) return;
                if (
                    url.pathname === window.location.pathname &&
                    url.search   === window.location.search   &&
                    url.hash     === ''
                ) return;
                destination = url.href;
            } catch (err) {
                return;
            }

            e.preventDefault();

            hidePage(function () {
                window.location.href = destination;
            });
        });
    }

    /* ── Public init ─────────────────────────────────────────────── */
    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        buildElements();
        revealPage();
        attachLinkHandlers();
    }

    function restoreScrollPosition() {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return {
        init: init,
        restoreScrollPosition: restoreScrollPosition
    };

})();
