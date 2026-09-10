function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
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

function initPointerFollow({
  selector = ".hero__portrait",
  maximumMovement = 90,
} = {}) {
  const element = document.querySelector(selector);

  if (!element) return;

  let elementRect = null;

  function updateElementRect() {
    elementRect = element.getBoundingClientRect();
  }

  function handlePointerMove(event) {
    if (!elementRect) {
      updateElementRect();
    }

    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;

    const normalizedX = (event.clientX - centerX) / (elementRect.width / 2);

    const normalizedY = (event.clientY - centerY) / (elementRect.height / 2);

    const moveX = normalizedX * maximumMovement;
    const moveY = normalizedY * maximumMovement;

    element.style.setProperty("--move-x", `${moveX}px`);
    element.style.setProperty("--move-y", `${moveY}px`);
  }

  function resetPosition() {
    element.style.setProperty("--move-x", "0px");
    element.style.setProperty("--move-y", "0px");

    elementRect = null;
  }

  element.addEventListener("pointerenter", updateElementRect);
  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerleave", resetPosition);

  window.addEventListener("resize", updateElementRect);
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

function setup() {
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

  initPointerFollow({
    selector: ".hero__portrait",
    maximumMovement: 90,
  });

  initTypingSection({
    sectionSelector: ".about",
    targetSelector: "[data-type]",
    threshold: 0.25,
    initialDelay: 650,
    pauseBetweenElements: 160,
  });
}
// prova
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
