/**
 * Dashboard - Sidebar toggle and mobile menu
 */
(function() {
    'use strict';

    function init() {
        var sidebar = document.getElementById('dashboard-sidebar');
        var sidebarToggle = document.getElementById('sidebar-toggle');
        var mobileMenuBtn = document.getElementById('header-mobile-menu');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('sidebar--collapsed');
                document.body.classList.toggle('sidebar-collapsed');
            });
        }

        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('sidebar--open');
                document.body.classList.toggle('sidebar-open');
                mobileMenuBtn.classList.toggle('is-active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('sidebar--open')) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('sidebar--open');
                    document.body.classList.remove('sidebar-open');
                    if (mobileMenuBtn) mobileMenuBtn.classList.remove('is-active');
                }
            }
        });

        // Close on resize if open
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && sidebar) {
                sidebar.classList.remove('sidebar--open');
                document.body.classList.remove('sidebar-open');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('is-active');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
