/*!
 * ECSG — Enterprise Cloud Solutions Group
 * main.js — Vanilla JS, no frameworks, production-ready
 */

(function () {
  'use strict';

  /* ─── Navbar: Scroll State ──────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on init
  }

  /* ─── Desktop Dropdown Menus ────────────────────────────────── */
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  dropdownItems.forEach(item => {
    const trigger = item.querySelector('.nav-link');
    const menu    = item.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    let closeTimer;

    const openMenu = () => {
      clearTimeout(closeTimer);
      // Close others
      dropdownItems.forEach(other => {
        if (other !== item) {
          other.querySelector('.dropdown-menu')?.classList.remove('open');
          other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
          other.removeAttribute('aria-expanded');
        }
      });
      menu.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      item.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = (delay = 150) => {
      closeTimer = setTimeout(() => {
        menu.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        item.removeAttribute('aria-expanded');
      }, delay);
    };

    // Hover
    item.addEventListener('mouseenter', () => openMenu());
    item.addEventListener('mouseleave', () => closeMenu());

    // Keyboard: Enter/Space on trigger
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menu.classList.contains('open') ? closeMenu(0) : openMenu();
      }
      if (e.key === 'Escape') closeMenu(0);
    });

    // Keyboard: Escape from within menu
    menu.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeMenu(0);
        trigger.focus();
      }
    });

    // Close when focus leaves entire item
    item.addEventListener('focusout', e => {
      if (!item.contains(e.relatedTarget)) closeMenu(0);
    });
  });

  // Close all dropdowns on Escape from anywhere
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dropdownItems.forEach(item => {
        item.querySelector('.dropdown-menu')?.classList.remove('open');
        item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ─── Mobile Nav ────────────────────────────────────────────── */
  const hamburger       = document.getElementById('hamburger');
  const mobileNav       = document.getElementById('mobileNav');
  const mobileOverlay   = document.getElementById('mobileOverlay');
  const mobileNavClose  = document.getElementById('mobileNavClose');

  const openMobileNav = () => {
    mobileNav?.classList.add('open');
    mobileOverlay?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first item
    mobileNav?.querySelector('a, button')?.focus();
  };

  const closeMobileNav = () => {
    mobileNav?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger?.focus();
  };

  hamburger?.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? closeMobileNav() : openMobileNav();
  });
  mobileOverlay?.addEventListener('click', closeMobileNav);
  mobileNavClose?.addEventListener('click', closeMobileNav);

  // Trap focus in mobile nav
  mobileNav?.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ─── Mobile Submenus ───────────────────────────────────────── */
  document.querySelectorAll('.mobile-nav-link.has-sub').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const submenu = document.getElementById(link.dataset.submenu);
      if (!submenu) return;
      const isOpen = submenu.classList.contains('open');
      // Close all
      document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.mobile-nav-link.has-sub').forEach(l => l.classList.remove('expanded'));
      // Open if was closed
      if (!isOpen) {
        submenu.classList.add('open');
        link.classList.add('expanded');
        link.setAttribute('aria-expanded', 'true');
      } else {
        link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ─── Scroll Reveal (IntersectionObserver) ──────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback for old browsers
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ─── Smooth scroll for anchor links ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72');
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile nav if open
        closeMobileNav();
      }
    });
  });

  /* ─── Hero stats counter animation ─────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const statsIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => statsIO.observe(c));
  }

})();
