const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const mainNavLinks = document.querySelectorAll("#main-nav a, .mobile-nav-link");
const counters = document.querySelectorAll(".counter");
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");
const currentYearElement = document.getElementById("current-year");
const messageToggles = document.querySelectorAll(".toggle-message");
const pillarTabs = document.querySelectorAll(".pillar-tab");
const pillarPanels = document.querySelectorAll(".pillar-panel");
const storiesTrack = document.querySelector(".stories-track");
const storyNavButtons = document.querySelectorAll(".stories-nav");
const storyDots = document.querySelectorAll(".story-dot");
const backToTopButton = document.getElementById("back-to-top");
const themeToggleDesktop = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const prefersDark = typeof window !== "undefined" && "matchMedia" in window
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;
const THEME_STORAGE_KEY = "nayee-umang-theme";

function toggleMobileMenu() {
  mobileMenu.classList.toggle("hidden");
  const expanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
  mobileMenuToggle.setAttribute("aria-expanded", (!expanded).toString());
}

function closeMobileMenu() {
  if (!mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
  }
}

function smoothScroll(event) {
  const targetId = event.currentTarget.getAttribute("href");
  if (targetId && targetId.startsWith("#")) {
    event.preventDefault();
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileMenu();
    }
  }
}

function animateCounter(counter) {
  const target = parseInt(counter.getAttribute("data-count"), 10);
  const duration = 1500;
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.floor(easedProgress * target).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function observeCounters() {
  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function handleContactForm(event) {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  formFeedback.classList.remove("hidden");
  formFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
  contactForm.reset();
}

function updateCurrentYear() {
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear().toString();
  }
}

function toggleMessagePanel(event) {
  const button = event.currentTarget;
  const targetId = button.getAttribute("data-target");
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) {
    return;
  }

  const isExpanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", (!isExpanded).toString());
  target.classList.toggle("hidden", isExpanded);

  const label = button.querySelector(".toggle-message-label");
  const icon = button.querySelector(".toggle-message-icon");
  if (label) {
    label.textContent = isExpanded ? "Hear Noreen's Message" : "Hide Message";
  }
  if (icon) {
    icon.classList.toggle("rotate-45", !isExpanded);
  }
}

function updateThemeIcons(isDark) {
  const buttons = [themeToggleDesktop, themeToggleMobile].filter(Boolean);
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", isDark.toString());
    const sunIcon = button.querySelector(".theme-icon-sun");
    const moonIcon = button.querySelector(".theme-icon-moon");
    if (sunIcon) {
      sunIcon.classList.toggle("hidden", isDark);
    }
    if (moonIcon) {
      moonIcon.classList.toggle("hidden", !isDark);
    }
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  updateThemeIcons(isDark);
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to read stored theme preference.", error);
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Unable to store theme preference.", error);
  }
}

function initTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    applyTheme(storedTheme);
    return;
  }

  const prefersDarkMode = prefersDark ? prefersDark.matches : false;
  applyTheme(prefersDarkMode ? "dark" : "light");
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains("dark");
  const newTheme = isCurrentlyDark ? "light" : "dark";
  applyTheme(newTheme);
  storeTheme(newTheme);
}

function setTabState(tab, isActive) {
  const activeClasses = (tab.getAttribute("data-active-classes") || "").split(" ");
  const inactiveClasses = (tab.getAttribute("data-inactive-classes") || "").split(" ");
  const allClasses = [...activeClasses, ...inactiveClasses];

  allClasses.forEach((cls) => {
    if (cls) {
      tab.classList.remove(cls);
    }
  });

  const classesToAdd = isActive ? activeClasses : inactiveClasses;
  classesToAdd.forEach((cls) => {
    if (cls) {
      tab.classList.add(cls);
    }
  });

  tab.setAttribute("aria-selected", isActive.toString());
}

function activatePillarTab(tab) {
  const targetId = tab.getAttribute("data-target");
  const panel = targetId ? document.getElementById(targetId) : null;
  if (!panel) {
    return;
  }

  pillarTabs.forEach((btn) => {
    setTabState(btn, btn === tab);
  });

  pillarPanels.forEach((panelEl) => {
    const isActive = panelEl === panel;
    panelEl.classList.toggle("hidden", !isActive);
    if (isActive) {
      panelEl.focus({ preventScroll: true });
    }
  });
}

let activeStoryIndex = 0;
let storyScrollTimeoutId = 0;

function updateStoryControls(totalCards) {
  storyDots.forEach((dot) => {
    const dotIndex = Number(dot.getAttribute("data-index"));
    const isActive = dotIndex === activeStoryIndex;
    dot.classList.toggle("bg-nuPrimary", isActive);
    dot.classList.toggle("border-nuPrimary/40", isActive);
    dot.classList.toggle("bg-white", !isActive);
    dot.classList.toggle("border-slate-300", !isActive);
  });

  storyNavButtons.forEach((button) => {
    const direction = button.getAttribute("data-direction");
    if (!direction) {
      return;
    }
    const isPrev = direction === "prev";
    const disabled =
      (isPrev && activeStoryIndex <= 0) || (!isPrev && activeStoryIndex >= totalCards - 1);
    button.setAttribute("aria-disabled", disabled.toString());
    button.classList.toggle("pointer-events-none", disabled);
    button.classList.toggle("opacity-40", disabled);
  });
}

function scrollToStory(index) {
  if (!storiesTrack) {
    return;
  }
  const cards = storiesTrack.querySelectorAll(".story-card");
  const totalCards = cards.length;
  if (!totalCards) {
    return;
  }

  const targetIndex = Math.max(0, Math.min(index, totalCards - 1));
  const targetCard = cards[targetIndex];
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    activeStoryIndex = targetIndex;
    updateStoryControls(totalCards);
  }
}

function handleStoryNav(event) {
  const direction = event.currentTarget.getAttribute("data-direction");
  if (!storiesTrack || !direction) {
    return;
  }
  const cards = storiesTrack.querySelectorAll(".story-card");
  const totalCards = cards.length;
  if (!totalCards) {
    return;
  }

  const nextIndex =
    direction === "prev"
      ? Math.max(0, activeStoryIndex - 1)
      : Math.min(totalCards - 1, activeStoryIndex + 1);
  scrollToStory(nextIndex);
}

function handleStoryDot(event) {
  const dotIndex = Number(event.currentTarget.getAttribute("data-index"));
  scrollToStory(dotIndex);
}

function detectStoryPosition() {
  if (!storiesTrack) {
    return;
  }
  const cards = storiesTrack.querySelectorAll(".story-card");
  const totalCards = cards.length;
  if (!totalCards) {
    return;
  }

  const trackRect = storiesTrack.getBoundingClientRect();
  let closestIndex = activeStoryIndex;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const distance = Math.abs(
      cardRect.left + cardRect.width / 2 - (trackRect.left + trackRect.width / 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  activeStoryIndex = closestIndex;
  updateStoryControls(totalCards);
}

function handleStoriesScroll() {
  window.clearTimeout(storyScrollTimeoutId);
  storyScrollTimeoutId = window.setTimeout(detectStoryPosition, 120);
}

function handleWindowScroll() {
  if (!backToTopButton) {
    return;
  }
  if (window.scrollY > 320) {
    backToTopButton.classList.remove("hidden");
  } else {
    backToTopButton.classList.add("hidden");
  }
}

function init() {
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
  }

  mainNavLinks.forEach((link) => {
    link.addEventListener("click", smoothScroll);
  });

  if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", handleContactForm);
  }

  messageToggles.forEach((toggle) => {
    toggle.addEventListener("click", toggleMessagePanel);
  });

  if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener("click", toggleTheme);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", toggleTheme);
  }
  if (prefersDark) {
    prefersDark.addEventListener("change", (event) => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        return;
      }
      applyTheme(event.matches ? "dark" : "light");
    });
  }
  initTheme();

  if (pillarTabs.length && pillarPanels.length) {
    pillarTabs.forEach((tab) => {
      tab.addEventListener("click", () => activatePillarTab(tab));
    });
    activatePillarTab(pillarTabs[0]);
  }

  if (storiesTrack) {
    storiesTrack.addEventListener("scroll", handleStoriesScroll, { passive: true });
    storyNavButtons.forEach((button) => {
      button.addEventListener("click", handleStoryNav);
    });
    storyDots.forEach((dot) => {
      dot.addEventListener("click", handleStoryDot);
    });
    detectStoryPosition();
    window.addEventListener("resize", detectStoryPosition);
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    handleWindowScroll();
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
  }

  observeCounters();
  updateCurrentYear();
}

document.addEventListener("DOMContentLoaded", init);

