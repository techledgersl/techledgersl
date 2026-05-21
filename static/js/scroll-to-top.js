/**
 * Scroll to top button: show when user scrolls down, smooth scroll to top on click.
 */
(function () {
    var SCROLL_THRESHOLD = 400;
    var button = document.getElementById('scroll-to-top');

    if (!button) return;

    function toggleVisibility() {
        if (window.scrollY > SCROLL_THRESHOLD) {
            button.classList.add('scroll-to-top--visible');
        } else {
            button.classList.remove('scroll-to-top--visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    button.addEventListener('click', scrollToTop);

    toggleVisibility();
})();
