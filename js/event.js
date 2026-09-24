function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
function initScrollReveal({
  selector = ".scroll-reveal",
  activeClass = "is-visible",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  staggerDelay = 100,
} = {}) {
  const elements = [...document.querySelectorAll(selector)];

  if (elements.length === 0) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add(activeClass);
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add(activeClass);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold,
      rootMargin,
    },
  );

  elements.forEach((element, index) => {
    element.style.setProperty(
      "--reveal-delay",
      `${(index % 3) * staggerDelay}ms`,
    );

    observer.observe(element);
  });
}

async function playIntro({
  introSelector = ".intro",
  wordSelector = ".intro__word",
  initialDelay = 250,
  visibleDuration = 700,
  exitDuration = 500,
  finalDelay = 200,
} = {}) {
  const intro = document.querySelector(introSelector);
  const words = [...document.querySelectorAll(wordSelector)];

  if (!intro || words.length === 0) {
    document.body.classList.add("intro-finished");
    return;
  }

  await wait(initialDelay);

  for (const word of words) {
    word.classList.add("is-visible");

    await wait(visibleDuration);

    word.classList.add("is-exiting");

    await wait(exitDuration);
  }

  await wait(finalDelay);

  document.body.classList.add("intro-finished");
  intro.classList.add("is-leaving");

  function removeIntro(event) {
    if (event.target !== intro) return;

    intro.removeEventListener("transitionend", removeIntro);
    intro.remove();
  }

  intro.addEventListener("transitionend", removeIntro);
}

async function typeText(
  element,
  { defaultSpeed = 70, randomDelayMaximum = 35, cursorEndDelay = 220 } = {},
) {
  const output = element.querySelector(".type-word__text");
  const text = element.dataset.type;

  if (!output || !text) return;

  const speed = Number(element.dataset.speed) || defaultSpeed;

  output.textContent = "";
  element.classList.add("is-typing");

  for (const character of text) {
    output.textContent += character;

    const randomDelay = Math.random() * randomDelayMaximum;

    await wait(speed + randomDelay);
  }

  await wait(cursorEndDelay);

  element.classList.remove("is-typing");
}

function showCompleteTypingSection(section, targetSelector = "[data-type]") {
  const typingElements = [...section.querySelectorAll(targetSelector)];

  typingElements.forEach((element) => {
    const output = element.querySelector(".type-word__text");

    if (!output) return;

    output.textContent = element.dataset.type || "";
  });

  section.classList.add("is-active");
}

async function runTypingSequence(
  section,
  {
    targetSelector = "[data-type]",
    initialDelay = 650,
    pauseBetweenElements = 160,
  } = {},
) {
  const typingElements = [...section.querySelectorAll(targetSelector)];

  section.classList.add("is-active");

  await wait(initialDelay);

  for (const element of typingElements) {
    await typeText(element);
    await wait(pauseBetweenElements);
  }
}

function initTypingSection({
  sectionSelector = ".about",
  targetSelector = "[data-type]",
  threshold = 0.25,
  initialDelay = 650,
  pauseBetweenElements = 160,
} = {}) {
  const section = document.querySelector(sectionSelector);

  if (!section) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    showCompleteTypingSection(section, targetSelector);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    runTypingSequence(section, {
      targetSelector,
      initialDelay,
      pauseBetweenElements,
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (!entry.isIntersecting) return;

      observer.unobserve(section);

      runTypingSequence(section, {
        targetSelector,
        initialDelay,
        pauseBetweenElements,
      });
    },
    {
      threshold,
    },
  );

  observer.observe(section);
}

function inverter_color(element, enabled = true) {
  element.classList.toggle("is-color-inverted", enabled);
  return element;
}

let cursorController = null;

function initCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const outer = document.createElement("div");
  const inner = document.createElement("div");
  outer.className = "custom-cursor custom-cursor--outer";
  inner.className = "custom-cursor custom-cursor--inner";
  outer.setAttribute("aria-hidden", "true");
  inner.setAttribute("aria-hidden", "true");
  inverter_color(outer);
  inverter_color(inner);
  document.body.append(outer, inner);
  document.documentElement.classList.add("has-custom-cursor");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let targetX = 0;
  let targetY = 0;
  let outerX = 0;
  let outerY = 0;
  let frame = 0;
  let visible = false;
  let pointerX = 0;
  let pointerY = 0;
  let stickyElement = null;
  let engulfedElement = null;
  let tooltipBox = null;
  const engulfPadding = 8;
  const cursorAttraction = 0.3;
  const stickyMovement = 0.08;
  const stickyMaximumMovement = 6;
  const stickyReleaseDistance = 10;

  function resetStickyElement(element) {
    if (!element) return;

    element.classList.remove("is-sticking");
    element.style.setProperty("--sticky-x", "0px");
    element.style.setProperty("--sticky-y", "0px");
  }

  function moveStickyElement(element, event) {
    if (!element || reducedMotion) return;

    const bounds = element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const moveX = Math.max(
      -stickyMaximumMovement,
      Math.min(stickyMaximumMovement, (event.clientX - centerX) * stickyMovement),
    );
    const moveY = Math.max(
      -stickyMaximumMovement,
      Math.min(stickyMaximumMovement, (event.clientY - centerY) * stickyMovement),
    );

    element.classList.add("is-sticking");
    element.style.setProperty("--sticky-x", `${moveX}px`);
    element.style.setProperty("--sticky-y", `${moveY}px`);
  }

  function isInsideStickyReleaseArea(element, event) {
    if (!element?.isConnected) return false;

    const bounds = element.getBoundingClientRect();

    return (
      event.clientX >= bounds.left - stickyReleaseDistance &&
      event.clientX <= bounds.right + stickyReleaseDistance &&
      event.clientY >= bounds.top - stickyReleaseDistance &&
      event.clientY <= bounds.bottom + stickyReleaseDistance
    );
  }

  function place(element, x, y) {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  function placeOuter() {
    place(outer, outerX, outerY);

    if (tooltipBox && activeTooltip) {
      activeTooltip.style.left = `${outerX - tooltipBox.width / 2}px`;
      activeTooltip.style.top = `${outerY - tooltipBox.height / 2}px`;
    }
  }

  function updateOuterMode() {
    if (tooltipBox) {
      outer.style.width = `${tooltipBox.width}px`;
      outer.style.height = `${tooltipBox.height}px`;
      outer.style.borderRadius = "8px";
      targetX = tooltipBox.left + tooltipBox.width / 2;
      targetY = tooltipBox.top + tooltipBox.height / 2;
    } else if (engulfedElement?.isConnected) {
      const bounds = engulfedElement.getBoundingClientRect();
      outer.style.width = `${bounds.width + engulfPadding}px`;
      outer.style.height = `${bounds.height + engulfPadding}px`;
      outer.style.borderRadius =
        window.getComputedStyle(engulfedElement).borderRadius || "8px";
      targetX = bounds.left + bounds.width / 2;
      targetY = bounds.top + bounds.height / 2;
    } else {
      outer.style.width = "";
      outer.style.height = "";
      outer.style.borderRadius = "";
      targetX = pointerX;
      targetY = pointerY;
    }

    if (reducedMotion) {
      outerX = targetX;
      outerY = targetY;
      placeOuter();
    } else if (!frame) {
      frame = window.requestAnimationFrame(animateOuter);
    }
  }

  function animateOuter() {
    outerX += (targetX - outerX) * cursorAttraction;
    outerY += (targetY - outerY) * cursorAttraction;
    placeOuter();

    if (Math.abs(targetX - outerX) > 0.2 || Math.abs(targetY - outerY) > 0.2) {
      frame = window.requestAnimationFrame(animateOuter);
    } else {
      frame = 0;
    }
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    let nextStickyElement =
      event.target instanceof Element
        ? event.target.closest(".sticky")
        : null;

    if (
      !nextStickyElement &&
      isInsideStickyReleaseArea(stickyElement, event)
    ) {
      nextStickyElement = stickyElement;
    }

    if (stickyElement !== nextStickyElement) {
      resetStickyElement(stickyElement);
      stickyElement = nextStickyElement;
    }

    engulfedElement =
      event.target instanceof Element
        ? event.target.closest(".cursor--inglobe")
        : null;

    moveStickyElement(stickyElement, event);
    place(inner, pointerX, pointerY);

    if (!visible) {
      outerX = pointerX;
      outerY = pointerY;
      placeOuter();
      outer.classList.add("is-visible");
      visible = true;
    }

    inner.classList.add("is-visible");
    updateOuterMode();
  });

  cursorController = {
    showTooltip(box) {
      tooltipBox = box;
      updateOuterMode();

      if (!visible) {
        outerX = targetX;
        outerY = targetY;
        placeOuter();
        outer.classList.add("is-visible");
        visible = true;
      }
    },
    hideTooltip() {
      tooltipBox = null;
      updateOuterMode();
    },
  };

  window.addEventListener(
    "scroll",
    () => {
      if (engulfedElement && !tooltipBox) updateOuterMode();
    },
    true,
  );

  window.addEventListener("mouseout", (event) => {
    if (event.relatedTarget) return;
    hide_tooltip();
    resetStickyElement(stickyElement);
    stickyElement = null;
    engulfedElement = null;
    outer.classList.remove("is-visible");
    inner.classList.remove("is-visible");
    visible = false;
  });
}

let activeTooltip = null;
let tooltipClickEvent = null;

function hide_tooltip() {
  if (!activeTooltip) return;
  activeTooltip.classList.remove("is-visible");
  activeTooltip.setAttribute("aria-hidden", "true");
  cursorController?.hideTooltip();
}

function tooltip(text, sourceEvent = tooltipClickEvent) {
  if (!activeTooltip) {
    activeTooltip = document.createElement("div");
    activeTooltip.className = "tooltip";
    activeTooltip.setAttribute("role", "tooltip");
    inverter_color(activeTooltip);
    document.body.append(activeTooltip);
  }

  activeTooltip.textContent = String(text);

  const anchor =
    sourceEvent?.currentTarget instanceof Element
      ? sourceEvent.currentTarget
      : document.activeElement;
  const bounds = anchor?.getBoundingClientRect();
  const fromPointer =
    sourceEvent &&
    (sourceEvent.type.startsWith("pointer") || sourceEvent.detail > 0) &&
    Number.isFinite(sourceEvent.clientX) &&
    Number.isFinite(sourceEvent.clientY);
  const gap = 16;
  const x = fromPointer
    ? sourceEvent.clientX + gap
    : bounds
      ? bounds.left + bounds.width / 2 - activeTooltip.offsetWidth / 2
      : (window.innerWidth - activeTooltip.offsetWidth) / 2;
  const y = fromPointer
    ? sourceEvent.clientY + gap
    : bounds
      ? bounds.bottom + gap
      : (window.innerHeight - activeTooltip.offsetHeight) / 2;

  const left = Math.max(
    gap,
    Math.min(x, window.innerWidth - activeTooltip.offsetWidth - gap),
  );
  const top = Math.max(
    gap,
    Math.min(y, window.innerHeight - activeTooltip.offsetHeight - gap),
  );
  activeTooltip.style.left = `${left}px`;
  activeTooltip.style.top = `${top}px`;
  cursorController?.showTooltip({
    left,
    top,
    width: activeTooltip.offsetWidth,
    height: activeTooltip.offsetHeight,
  });
  activeTooltip.classList.add("is-visible");
  activeTooltip.setAttribute("aria-hidden", "false");
  return activeTooltip;
}

function initTooltip() {
  document.addEventListener(
    "click",
    (event) => {
      hide_tooltip();
      tooltipClickEvent = event;
      queueMicrotask(() => {
        if (tooltipClickEvent === event) tooltipClickEvent = null;
      });
    },
    true,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide_tooltip();
  });
}

let isSetupComplete = false;

function setup() {
  if (isSetupComplete) return;
  isSetupComplete = true;

  initCursor();
  initTooltip();
  initScrollReveal({
    selector: ".projects .scroll-reveal",
    threshold: 0.15,
    staggerDelay: 100,
  });
  playIntro({
    initialDelay: 250,
    visibleDuration: 700,
    exitDuration: 500,
  });

  initTypingSection({
    sectionSelector: ".about",
    targetSelector: "[data-type]",
    threshold: 0.25,
    initialDelay: 650,
    pauseBetweenElements: 160,
  });
}

function initScrollReveal({
  selector = ".scroll-reveal",
  activeClass = "is-visible",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  staggerDelay = 100,
} = {}) {
  const elements = [...document.querySelectorAll(selector)];

  if (elements.length === 0) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add(activeClass);
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add(activeClass);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold,
      rootMargin,
    },
  );

  elements.forEach((element, index) => {
    element.style.setProperty(
      "--reveal-delay",
      `${(index % 3) * staggerDelay}ms`,
    );

    observer.observe(element);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, {
    once: true,
  });
} else {
  setup();
}
