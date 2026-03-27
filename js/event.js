export function setup() {
  /* cursor */
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("ring");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
  });
  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animRing);
  })();
  document
    .querySelectorAll("a,button,.skill-pill,.proj,.bento-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.width = "18px";
        cursor.style.height = "18px";
        ring.style.width = "52px";
        ring.style.height = "52px";
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.width = "10px";
        cursor.style.height = "10px";
        ring.style.width = "36px";
        ring.style.height = "36px";
      });
    });

  /* mouse spotlight on bento cards */
  document.querySelectorAll(".bento-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty(
        "--mx",
        ((e.clientX - r.left) / r.width) * 100 + "%",
      );
      card.style.setProperty(
        "--my",
        ((e.clientY - r.top) / r.height) * 100 + "%",
      );
    });
  });

  /* scroll reveal */
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 70);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.07 },
  );
  document
    .querySelectorAll(".reveal,.reveal-left,.reveal-right")
    .forEach((el) => obs.observe(el));
}
