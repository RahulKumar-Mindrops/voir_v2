/**
 * VOIR Homepage — Vanilla JS + GSAP
 * Animations are progressive: page remains usable without GSAP.
 *
 * Hero slider: edit AUTO_MS / DURATION below.
 * Slide copy & images live in index.html (search "HERO SLIDER").
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function setMenuOpen(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    if (open) {
      mobileMenu.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    } else {
      mobileMenu.setAttribute("hidden", "");
      document.body.style.overflow = "";
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  }

  /* ---------- Smooth scroll for internal links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      if (typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined" && !prefersReducedMotion) {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: top, autoKill: true },
          ease: "power3.inOut",
        });
      } else {
        window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ---------- Newsletter validation ---------- */
  const form = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const messageEl = document.getElementById("newsletter-message");

  function setNewsletterMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove("is-error", "is-success");
    if (type) messageEl.classList.add(type);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form && emailInput) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();

      if (!value) {
        setNewsletterMessage("Please enter your email address.", "is-error");
        emailInput.focus();
        return;
      }

      if (!isValidEmail(value)) {
        setNewsletterMessage("Please enter a valid email address.", "is-error");
        emailInput.focus();
        return;
      }

      setNewsletterMessage("Thank you — you’re on the list.", "is-success");
      form.reset();
    });
  }

  /* ---------- Search placeholder ---------- */
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      window.alert("Search will be available in a future update.");
    });
  }

  /* =========================================================
     HERO SLIDER (GSAP)
     ========================================================= */
  const HERO_CONFIG = {
    autoplayMs: 6500,
    duration: 1.05,
    ease: "power3.inOut",
  };

  function initHeroSlider() {
    const root = document.getElementById("hero");
    if (!root) return;

    const slides = Array.from(root.querySelectorAll(".hero-slide"));
    const buttons = Array.from(root.querySelectorAll(".hero-pager__btn"));
    const thumb = root.querySelector(".hero-pager__thumb");
    const progress = root.querySelector(".hero-pager__progress");
    if (!slides.length) return;

    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    let busy = false;
    let autoTimer = null;
    let progressTween = null;
    const hasGsap = typeof gsap !== "undefined";

    function setPager(i) {
      buttons.forEach((btn, bi) => {
        const active = bi === i;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      if (thumb) {
        thumb.style.left = `${(i / slides.length) * 100}%`;
      }
    }

    function resetProgressBar() {
      if (!progress || !hasGsap || prefersReducedMotion) {
        if (progress) progress.style.transform = "scaleX(1)";
        return;
      }
      if (progressTween) progressTween.kill();
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      progressTween = gsap.to(progress, {
        scaleX: 1,
        duration: HERO_CONFIG.autoplayMs / 1000,
        ease: "none",
      });
    }

    function clearAutoplay() {
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
      }
    }

    function scheduleAutoplay() {
      clearAutoplay();
      if (prefersReducedMotion || slides.length < 2) return;
      autoTimer = window.setTimeout(() => {
        goTo((index + 1) % slides.length);
      }, HERO_CONFIG.autoplayMs);
      resetProgressBar();
    }

    function pauseSlideMedia(slide) {
      const video = slide && slide.querySelector(".hero-slide__video");
      if (video) video.pause();
    }

    function playSlideMedia(slide) {
      const video = slide && slide.querySelector(".hero-slide__video");
      if (!video || prefersReducedMotion) return;
      video.play().catch(() => {});
    }

    function animateIn(slide) {
      if (!hasGsap || prefersReducedMotion) return;
      const media = slide.querySelector(".hero-slide__video, .hero-slide__img");
      const parts = slide.querySelectorAll(
        ".hero-slide__eyebrow, .hero-slide__title, .hero-slide__tagline, .hero-slide__chips, .hero-slide__actions"
      );
      if (media) {
        gsap.fromTo(
          media,
          { scale: 1.1, opacity: 0.55 },
          { scale: 1, opacity: 1, duration: HERO_CONFIG.duration + 0.35, ease: "power2.out" }
        );
      }
      gsap.fromTo(
        parts,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.12,
        }
      );
    }

    function goTo(next) {
      if (busy || next === index || next < 0 || next >= slides.length) return;
      busy = true;
      clearAutoplay();

      const current = slides[index];
      const incoming = slides[next];

      incoming.classList.add("is-active");
      incoming.setAttribute("aria-hidden", "false");
      current.setAttribute("aria-hidden", "true");
      playSlideMedia(incoming);
      pauseSlideMedia(current);

      if (!hasGsap || prefersReducedMotion) {
        current.classList.remove("is-active");
        index = next;
        setPager(index);
        busy = false;
        scheduleAutoplay();
        return;
      }

      gsap.set(incoming, { opacity: 0, zIndex: 2 });
      gsap.set(current, { zIndex: 1 });

      const tl = gsap.timeline({
        defaults: { ease: HERO_CONFIG.ease },
        onComplete: () => {
          current.classList.remove("is-active");
          gsap.set(current, { clearProps: "opacity,zIndex" });
          gsap.set(incoming, { clearProps: "zIndex" });
          index = next;
          setPager(index);
          busy = false;
          scheduleAutoplay();
        },
      });

      tl.to(current, { opacity: 0, duration: HERO_CONFIG.duration * 0.85 }, 0)
        .to(incoming, { opacity: 1, duration: HERO_CONFIG.duration }, 0.08);

      animateIn(incoming);
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-goto"));
        if (Number.isFinite(target)) goTo(target);
      });
    });

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo((index + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo((index - 1 + slides.length) % slides.length);
      }
    });

    // Pause autoplay when tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearAutoplay();
        if (progressTween) progressTween.pause();
      } else {
        scheduleAutoplay();
      }
    });

    // Initial state
    setPager(index);
    playSlideMedia(slides[index]);
    if (hasGsap && !prefersReducedMotion) {
      const first = slides[index];
      const media = first.querySelector(".hero-slide__video, .hero-slide__img");
      const parts = first.querySelectorAll(
        ".hero-slide__eyebrow, .hero-slide__title, .hero-slide__tagline, .hero-slide__chips, .hero-slide__actions"
      );
      gsap.from(".logo", { opacity: 0, y: -12, duration: 0.8, ease: "power3.out" });
      gsap.from(".nav-list li", {
        opacity: 0,
        y: -10,
        duration: 0.55,
        stagger: 0.05,
        delay: 0.12,
        ease: "power3.out",
      });
      gsap.from(".header-actions", { opacity: 0, duration: 0.5, delay: 0.25 });
      if (media) {
        gsap.from(media, { scale: 1.12, opacity: 0.4, duration: 1.6, ease: "power2.out" });
      }
      gsap.from(parts, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.3,
        ease: "power3.out",
      });
      gsap.from(".hero-chrome", { opacity: 0, y: 16, duration: 0.7, delay: 0.7 });
    }

    scheduleAutoplay();
  }

  /* ---------- Full-page GSAP scroll animations ---------- */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || prefersReducedMotion) return;

    document.documentElement.classList.add("js-gsap");

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof ScrollToPlugin !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);
    }
    if (typeof ScrollTrigger === "undefined") return;

    function sectionIn(section, targets, vars) {
      if (!section || !targets || !targets.length) return;
      gsap.from(targets, {
        opacity: 0,
        y: 36,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        immediateRender: false,
        clearProps: "opacity,transform",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        ...vars,
      });
    }

    /* ---- Our Purpose ---- */
    const purpose = document.querySelector(".purpose");
    if (purpose) {
      sectionIn(
        purpose,
        purpose.querySelectorAll(".purpose__eyebrow, .purpose__title, .purpose__body, .purpose__cta"),
        { x: -28, y: 0 }
      );
      const pImg = purpose.querySelector(".purpose__visual");
      if (pImg) {
        gsap.from(pImg, {
          opacity: 0,
          x: 48,
          scale: 1.03,
          duration: 1.15,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: purpose, start: "top 80%", once: true },
        });
      }
      const pAside = purpose.querySelector(".purpose__aside");
      if (pAside) {
        gsap.from(pAside, {
          opacity: 0,
          y: -18,
          duration: 0.85,
          delay: 0.2,
          ease: "power2.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: purpose, start: "top 75%", once: true },
        });
      }
    }

    /* ---- TV Range ---- */
    const range = document.querySelector(".range");
    if (range) {
      const rangeIntro = range.querySelectorAll(".range__intro > *");
      const rangeTabsBar = range.querySelector(".range__tabs-bar");

      gsap.from(rangeIntro, {
        opacity: 0,
        y: 28,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        immediateRender: false,
        clearProps: "opacity,transform",
        scrollTrigger: {
          trigger: range.querySelector(".range__intro") || range,
          start: "top 88%",
          once: true,
        },
      });

      if (rangeTabsBar) {
        gsap.from(rangeTabsBar, {
          opacity: 0,
          y: 18,
          duration: 0.7,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: rangeTabsBar,
            start: "top 90%",
            once: true,
          },
        });
      }

      const activePanel = range.querySelector(".range-panel.is-active");
      if (activePanel) {
        gsap.from(activePanel.querySelectorAll(".range-panel__media, .range-panel__copy > *"), {
          opacity: 0,
          y: 24,
          duration: 0.75,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: activePanel, start: "top 85%", once: true },
        });
      }
    }

    /* ---- Technology ---- */
    const tech = document.querySelector(".technology");
    if (tech) {
      sectionIn(tech, tech.querySelectorAll(".technology__copy > *"), { x: -22, y: 0 });
      const techMedia = tech.querySelector(".technology__media");
      if (techMedia) {
        gsap.from(techMedia, {
          opacity: 0,
          x: 36,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: tech, start: "top 78%" },
        });
      }
      const techCards = tech.querySelectorAll(".tech-feature");
      if (techCards.length) {
        gsap.from(techCards, {
          opacity: 0,
          y: 40,
          scale: 0.97,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: tech.querySelector(".tech-features") || tech, start: "top 82%" },
        });
      }
    }

    /* ---- The Experience ---- */
    const experiences = document.querySelector(".experiences");
    if (experiences) {
      sectionIn(
        experiences,
        experiences.querySelectorAll(".experiences__header > *, .experiences__aside")
      );
      const expCards = experiences.querySelectorAll(".exp-card");
      if (expCards.length) {
        gsap.from(expCards, {
          opacity: 0,
          y: 48,
          scale: 0.96,
          duration: 0.85,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: experiences.querySelector(".experiences__grid") || experiences,
            start: "top 80%",
          },
        });
      }
    }

    /* ---- Why VOIR ---- */
    const why = document.querySelector(".why");
    if (why) {
      sectionIn(why, why.querySelectorAll(".why__header > *"));
      const whyCards = why.querySelectorAll(".why-card");
      if (whyCards.length) {
        gsap.from(whyCards, {
          opacity: 0,
          y: 32,
          duration: 0.75,
          stagger: 0.09,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: why.querySelector(".why__grid") || why,
            start: "top 82%",
            once: true,
          },
        });
      }
    }

    /* ---- Design / Tech Story / Moments ---- */
    [
      { sel: ".design", copy: ".design__copy > *", media: ".design__media", fromX: -24 },
      { sel: ".tech-story", copy: ".tech-story__copy > *", media: ".tech-story__media", fromX: 24 },
      { sel: ".moments", copy: ".moments__copy > *", media: ".moments__media", fromX: -24 },
    ].forEach(({ sel, copy, media, fromX }) => {
      const section = document.querySelector(sel);
      if (!section) return;
      sectionIn(section, section.querySelectorAll(copy), { x: fromX, y: 0 });
      const mediaEl = section.querySelector(media);
      if (mediaEl) {
        gsap.from(mediaEl, {
          opacity: 0,
          x: -fromX,
          scale: 1.03,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 78%" },
        });
      }
    });

    /* ---- VOIR Care ---- */
    const care = document.querySelector(".care");
    if (care) {
      const careCards = care.querySelectorAll(".care-item");
      if (careCards.length) {
        gsap.from(careCards, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: care.querySelector(".care__grid") || care, start: "top 82%" },
        });
      }
      sectionIn(care, care.querySelectorAll(".care__copy > *"), { x: 28, y: 0 });
    }

    /* ---- Vision / World ---- */
    const vision = document.querySelector(".vision");
    if (vision) {
      sectionIn(vision, vision.querySelectorAll(".vision__copy > *, .vision__aside"), { x: -28, y: 0 });
      const visionBg = vision.querySelector(".vision__bg-img");
      if (visionBg) {
        gsap.from(visionBg, {
          scale: 1.08,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: vision, start: "top 80%" },
        });
      }
    }

    /* ---- Brand film CTA ---- */
    const brand = document.querySelector(".brand-cta");
    if (brand) {
      sectionIn(
        brand,
        brand.querySelectorAll(
          ".brand-cta__logo, .brand-cta__tagline, .brand-cta__sub, .brand-cta__content .btn"
        )
      );
    }

    /* ---- Footer ---- */
    const footer = document.querySelector(".site-footer");
    if (footer) {
      gsap.from(footer.querySelectorAll(".footer__brand, .footer__col, .footer__slogan"), {
        opacity: 0,
        y: 26,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: footer, start: "top 92%" },
      });
      gsap.from(footer.querySelector(".footer__bottom"), {
        opacity: 0,
        y: 14,
        duration: 0.65,
        delay: 0.2,
        ease: "power2.out",
        scrollTrigger: { trigger: footer, start: "top 90%" },
      });
    }

    /* Eyebrow rule draw */
    gsap.utils.toArray(".section-eyebrow__line, .purpose__eyebrow-line").forEach((line) => {
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: line.closest("p") || line,
          start: "top 88%",
        },
      });
    });

    /* Parallax media (scrub) */
    [
      ".purpose__video",
      ".purpose__img",
      ".technology__video",
      ".technology__media img",
      ".design__video",
      ".design__media img",
      ".tech-story__video",
      ".tech-story__media img",
      ".moments__video",
      ".moments__media img",
      ".brand-cta__video",
      ".brand-cta__media img",
      ".exp-card__media",
    ].forEach((sel) => {
      gsap.utils.toArray(sel).forEach((img) => {
        const trigger = img.closest("section") || img.parentElement;
        gsap.fromTo(
          img,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.15,
            },
          }
        );
      });
    });

    /* Desktop micro-interactions */
    if (window.matchMedia("(min-width: 901px)").matches) {
      document
        .querySelectorAll(".btn, .hero-cta, .range-panel__btn, .text-link, .purpose__cta")
        .forEach((btn) => {
          btn.addEventListener("mouseenter", () => {
            gsap.to(btn, { y: -2, duration: 0.22, ease: "power2.out" });
          });
          btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { y: 0, duration: 0.22, ease: "power2.out" });
          });
        });

      document.querySelectorAll(".tech-feature, .exp-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
        });
      });
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  function initRangeTabs() {
    const tabs = Array.from(document.querySelectorAll("[data-range-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-range-panel]"));
    if (!tabs.length || !panels.length) return;

    const hasGsap = typeof gsap !== "undefined";

    function setPlayButtonState(playBtn, playing) {
      if (!playBtn) return;
      playBtn.classList.toggle("is-playing", playing);
      const label = playBtn.querySelector("span:last-child");
      if (label) label.textContent = playing ? "Pause video" : "Watch the video";
      playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
    }

    function pausePanelVideo(panel) {
      const video = panel.querySelector(".range-panel__video");
      const playBtn = panel.querySelector("[data-range-play]");
      const media = panel.querySelector(".range-panel__media");
      if (video) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {}
      }
      if (media) media.classList.remove("is-video-focus");
      setPlayButtonState(playBtn, false);
    }

    function playPanelVideo(panel, options) {
      const focus = options && options.focus;
      const video = panel.querySelector(".range-panel__video");
      const playBtn = panel.querySelector("[data-range-play]");
      const media = panel.querySelector(".range-panel__media");
      if (!video) return;

      if (prefersReducedMotion) {
        if (media) media.classList.remove("is-video-focus");
        setPlayButtonState(playBtn, false);
        return;
      }

      const attempt = video.play();
      const settle = () => {
        if (focus && media) {
          media.classList.add("is-video-focus");
          setPlayButtonState(playBtn, true);
        } else {
          if (media) media.classList.remove("is-video-focus");
          setPlayButtonState(playBtn, false);
        }
      };

      if (attempt && typeof attempt.then === "function") {
        attempt.then(settle).catch(() => {
          if (media) media.classList.remove("is-video-focus");
          setPlayButtonState(playBtn, false);
        });
      } else {
        settle();
      }
    }

    function activate(id) {
      tabs.forEach((tab) => {
        const on = tab.getAttribute("data-range-tab") === id;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });

      panels.forEach((panel) => {
        const on = panel.getAttribute("data-range-panel") === id;
        if (on) {
          panel.removeAttribute("hidden");
          panel.classList.add("is-active");
          if (hasGsap && !prefersReducedMotion) {
            const media = panel.querySelector(".range-panel__media");
            const copyBits = panel.querySelectorAll(".range-panel__copy > *");
            gsap.fromTo(
              panel,
              { opacity: 0 },
              { opacity: 1, duration: 0.35, ease: "power1.out" }
            );
            if (media) {
              gsap.fromTo(
                media,
                { opacity: 0, x: -24, scale: 1.02 },
                { opacity: 1, x: 0, scale: 1, duration: 0.65, ease: "power3.out" }
              );
            }
            if (copyBits.length) {
              gsap.fromTo(
                copyBits,
                { opacity: 0, y: 22 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.55,
                  stagger: 0.06,
                  ease: "power3.out",
                  delay: 0.08,
                }
              );
            }
          }
          playPanelVideo(panel);
        } else {
          pausePanelVideo(panel);
          panel.setAttribute("hidden", "");
          panel.classList.remove("is-active");
        }
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-range-tab");
        if (id) activate(id);
      });
    });

    document.querySelectorAll("[data-range-play]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        // Play button is decorative — do not start/focus video on click
      });
    });

    // Autoplay the initially active tab (and when section scrolls into view)
    const initial =
      tabs.find((t) => t.classList.contains("is-active")) ||
      tabs[0];
    const initialId = initial && initial.getAttribute("data-range-tab");

    const section = document.getElementById("range");
    if (section && "IntersectionObserver" in window) {
      let visible = false;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visible = entry.isIntersecting;
            const active = panels.find((p) => p.classList.contains("is-active"));
            if (!active) return;
            if (visible) playPanelVideo(active);
            else pausePanelVideo(active);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(section);
      if (initialId) activate(initialId);
    } else if (initialId) {
      activate(initialId);
    }
  }

  function initAmbientVideos() {
    const videos = Array.from(document.querySelectorAll("video.media-video, video.hero-slide__video"));
    if (!videos.length) return;

    const playVideo = (video) => {
      if (prefersReducedMotion) return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      videos.forEach(playVideo);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) playVideo(video);
          else video.pause();
        });
      },
      { threshold: 0.28, rootMargin: "80px 0px" }
    );

    videos.forEach((video) => {
      // Hero videos are managed by the slider; still observe for offscreen pause
      if (video.classList.contains("hero-slide__video")) {
        const slide = video.closest(".hero-slide");
        if (slide && !slide.classList.contains("is-active")) {
          video.pause();
          io.observe(video);
          return;
        }
      }
      io.observe(video);
    });
  }

  function boot() {
    initHeroSlider();
    initRangeTabs();
    initAmbientVideos();
    initScrollAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
