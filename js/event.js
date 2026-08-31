function setup() {
  const intro = document.querySelector(".intro");
  const words = [...document.querySelectorAll(".intro__word")];

  if (!intro || words.length === 0) return;

  const wait = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function playIntro() {
    await wait(250);

    for (const word of words) {
      word.classList.add("is-visible");
      await wait(1100);

      word.classList.add("is-exiting");
      await wait(500);
    }

    await wait(200);

    document.body.classList.add("intro-finished");
    intro.classList.add("is-leaving");

    intro.addEventListener("transitionend", (event) => {
      if (event.target === intro) intro.remove();
    });
  }

  playIntro();
}
