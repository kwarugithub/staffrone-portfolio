/* =========================================================
   STAFFRONE OCHIENG OTIENO — PORTFOLIO
   Interaction layer. No external framework required.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initTypewriter();
  initScrollReveal();
  initStatCounters();
  initSkillBars();
  initTimelineReveal();
  initContactForm();
  initValueModal();
});

/* ---------------- Mobile nav ---------------- */
function initNavToggle() {
  const burger = document.getElementById("nav-burger");
  const links = document.getElementById("nav-links");
  if (!burger || !links) return;

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- Hero terminal typewriter ---------------- */
function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const lines = [
    "resolving ticket #2291...",
    "monitoring core switch uptime...",
    "securing endpoint access...",
    "whoami: ICT support & cybersecurity"
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    el.textContent = lines[lines.length - 1];
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = lines[lineIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }
    setTimeout(tick, deleting ? 28 : 46);
  }

  tick();
}

/* ---------------- Generic scroll reveal ---------------- */
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------------- Timeline reveal (staggered) ---------------- */
function initTimelineReveal() {
  const items = document.querySelectorAll(".timeline__item");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------------- Hero stat counters ---------------- */
function initStatCounters() {
  const stats = document.querySelectorAll(".stat__value");
  if (!stats.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((stat) => observer.observe(stat));
}

/* ---------------- Animated skill bars ---------------- */
function initSkillBars() {
  const skills = document.querySelectorAll(".skill");
  if (!skills.length) return;

  skills.forEach((skill) => {
    const level = skill.dataset.level || "0";
    const fill = skill.querySelector(".skill__fill");
    if (fill) fill.style.setProperty("--target-width", `${level}%`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  skills.forEach((skill) => observer.observe(skill));
}

/* ---------------- Contact form ----------------
   Front-end only: swap the fetch() call below for your own
   backend/endpoint (e.g. Formspree, Netlify Forms, EmailJS)
   to actually deliver messages.
------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      status.textContent = "Please fill in every field before sending.";
      status.style.color = "var(--accent-amber)";
      return;
    }

    // Placeholder success state — connect a real form handler here.
    status.textContent = "Message ready — connect a form handler (e.g. Formspree) to deliver it.";
    status.style.color = "var(--accent-cyan)";
    form.reset();
  });
}

/* ---------------- Values: clickable cards + detail modal ---------------- */
function initValueModal() {
  const cards = document.querySelectorAll(".value[data-detail]");
  const modal = document.getElementById("value-modal");
  const dataScript = document.getElementById("value-details");
  if (!cards.length || !modal || !dataScript) return;

  let details = {};
  try {
    details = JSON.parse(dataScript.textContent);
  } catch (err) {
    console.error("Could not parse value details:", err);
    return;
  }

  const iconEl = document.getElementById("value-modal-icon");
  const titleEl = document.getElementById("value-modal-title");
  const bodyEl = document.getElementById("value-modal-body");
  let lastFocused = null;

  function openModal(key) {
    const entry = details[key];
    if (!entry) return;

    iconEl.className = entry.icon;
    titleEl.textContent = entry.title;
    bodyEl.textContent = entry.body;

    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".value-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.detail));
  });

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}
