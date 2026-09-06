/* ---------------------------------------------------------------------------
   TechLedger Solutions — public site behaviour.

   Everything here is progressive: the page is complete and readable without
   this file. The `js-motion` class is what switches the CSS from "already
   visible" to "reveals on scroll", so a visitor with JS disabled never sees a
   permanently hidden section.
   --------------------------------------------------------------------------- */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!reduceMotion) {
		document.documentElement.classList.add('js-motion');
	}

	document.addEventListener('DOMContentLoaded', function () {
		mobileNav();
		stickyHeader();
		revealOnScroll();
		heroSlider();
		markCurrentSection();
	});

	/* ------------------------------------------------------------- nav ---- */

	function mobileNav() {
		var toggle = document.querySelector('.site-nav-toggle');
		var nav = document.getElementById('site-nav');
		if (!toggle || !nav) return;

		toggle.addEventListener('click', function () {
			var open = nav.getAttribute('data-open') === 'true';
			nav.setAttribute('data-open', open ? 'false' : 'true');
			toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
		});

		// Close the panel when a link is followed, so returning via the back
		// button does not land on an open menu.
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) {
				nav.setAttribute('data-open', 'false');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	/* ---------------------------------------------------------- header ---- */

	function stickyHeader() {
		var header = document.querySelector('.site-header');
		if (!header) return;

		var ticking = false;
		function update() {
			header.classList.toggle('is-stuck', window.scrollY > 8);
			ticking = false;
		}
		window.addEventListener('scroll', function () {
			if (!ticking) {
				window.requestAnimationFrame(update);
				ticking = true;
			}
		}, { passive: true });
		update();
	}

	/* ---------------------------------------------------------- reveal ---- */

	function revealOnScroll() {
		var targets = [].slice.call(document.querySelectorAll('.site-reveal, .site-reveal-group'));
		if (!targets.length) return;

		function revealAll() {
			targets.forEach(function (el) { el.classList.add('is-in'); });
		}

		if (reduceMotion || !('IntersectionObserver' in window)) {
			revealAll();
			return;
		}

		// Driven from scroll position rather than IntersectionObserver. The
		// observer is the tidier API, but it hides content until it reports,
		// and some embedded and automation browsers deliver only an initial
		// all-false callback and then go quiet — which leaves every section on
		// the page permanently invisible. A measured top edge cannot fail that
		// way, and once an element is revealed it drops out of the list, so
		// this settles to nothing.
		var pending = targets.slice();

		function sweep() {
			var limit = window.innerHeight * 0.92;
			pending = pending.filter(function (el) {
				if (el.getBoundingClientRect().top >= limit) return true;
				el.classList.add('is-in');
				return false;
			});
			if (!pending.length) {
				window.removeEventListener('scroll', onScroll);
				window.removeEventListener('resize', onScroll);
			}
		}

		var ticking = false;
		function onScroll() {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(function () { sweep(); ticking = false; });
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		sweep();

		// Late-loading images and webfonts change the height of the page after
		// first paint, so re-measure once everything has settled.
		window.addEventListener('load', sweep);
	}

	/* ------------------------------------------------------------ hero ---- */

	function heroSlider() {
		var hero = document.querySelector('.site-hero');
		if (!hero) return;

		var slides = hero.querySelectorAll('.site-hero__slide');
		var dots = hero.querySelectorAll('.site-hero__dots button');
		if (slides.length < 2) {
			var controls = hero.querySelector('.site-hero__controls');
			if (controls) controls.hidden = true;
			return;
		}

		hero.style.setProperty('--hero-count', slides.length);

		// Slides after the first carry their photograph in data-bg so it is not
		// part of the initial page load. The first slide is on screen
		// immediately and stays in the markup; the rest are not needed for
		// several seconds, and on a metered connection that is worth the wait.
		function loadDeferredSlides() {
			slides.forEach(function (slide) {
				var url = slide.getAttribute('data-bg');
				if (!url) return;
				slide.style.backgroundImage = 'url("' + url + '")';
				slide.removeAttribute('data-bg');
			});
		}
		if (document.readyState === 'complete') {
			loadDeferredSlides();
		} else {
			window.addEventListener('load', loadDeferredSlides);
		}

		var cycle = 28000;
		var per = cycle / slides.length;
		var timer = null;
		var started = window.performance.now();

		function show(index) {
			dots.forEach(function (d, n) {
				d.setAttribute('aria-current', n === index ? 'true' : 'false');
			});
		}

		// The photographs are cross-faded by CSS animation, so the dots must
		// follow that timing rather than keep their own. Deriving the index
		// from elapsed time — rather than incrementing a counter on a timer —
		// keeps the two locked together: an interval that fires a few
		// milliseconds late every cycle would otherwise drift until the marked
		// dot and the photograph on screen disagree.
		function tick() {
			show(Math.floor(((window.performance.now() - started) % cycle) / per));
		}

		dots.forEach(function (dot, n) {
			dot.addEventListener('click', function () {
				// Choosing a photograph settles the hero on it and stops the
				// rotation — with no play control on the banner, a viewer who
				// picked a slide only to have it slide away again would have no
				// way to get it back.
				//
				// The animation has to be removed rather than paused: a paused
				// animation still supplies the property it animates and beats an
				// inline style, so setting opacity alone would leave the previous
				// photograph showing underneath this one.
				if (timer) { window.clearInterval(timer); timer = null; }
				hero.classList.add('is-paused');
				slides.forEach(function (s, m) {
					s.style.animation = 'none';
					s.style.opacity = m === n ? '1' : '0';
				});
				show(n);
			});
		});

		tick();
		if (!reduceMotion) {
			timer = window.setInterval(tick, 500);
		}
	}

	/* ------------------------------------------------- contents highlight -- */

	// The rail's "Page contents" list marks whichever section is currently in
	// view, so a long page still tells you where you are.
	function markCurrentSection() {
		var links = document.querySelectorAll('.site-contents a[href^="#"]');
		if (!links.length || !('IntersectionObserver' in window)) return;

		var map = {};
		var sections = [];
		links.forEach(function (link) {
			var id = link.getAttribute('href').slice(1);
			var section = document.getElementById(id);
			if (!section) return;
			map[id] = link;
			sections.push(section);
		});
		if (!sections.length) return;

		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = map[entry.target.id];
				if (!link) return;
				if (entry.isIntersecting) {
					links.forEach(function (l) { l.removeAttribute('aria-current'); });
					link.setAttribute('aria-current', 'true');
				}
			});
		}, { rootMargin: '-20% 0px -70% 0px' });

		sections.forEach(function (s) { io.observe(s); });
	}
})();
