/**
 * Integrations Circle JavaScript - Pause rotation on icon hover
 */

const IntegrationsCircle = (function() {
    'use strict';

    let circle = null;
    let icons = [];
    let isInitialized = false;

    /**
     * Initialize integrations circle hover pause functionality
     */
    function init() {
        if (isInitialized) return;

        circle = document.querySelector('.integrations__circle');
        if (!circle) return;

        icons = Array.from(circle.querySelectorAll('.integration-icon'));

        // Add hover event listeners to each icon
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', handleIconHover);
            icon.addEventListener('mouseleave', handleIconLeave);
        });

        isInitialized = true;
    }

    /**
     * Handle icon hover - pause rotation
     */
    function handleIconHover() {
        if (circle) {
            circle.style.animationPlayState = 'paused';
        }
    }

    /**
     * Handle icon leave - resume rotation
     */
    function handleIconLeave() {
        if (circle) {
            circle.style.animationPlayState = 'running';
        }
    }

    // Public API
    return {
        init: init
    };

})();

