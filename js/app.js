const translations = {
  en: {
    pageTitle: "Federico Cresci | Software Developer",
    intro: ["Inquisitive,", "Imaginative,", "Genuine."],
    contact: "Get in touch",
    projectsLink: "Projects",
    heroBefore: "I’m a ",
    heroLink: "software developer",
    heroAfter: " based in Italy, open to new opportunities.",
    heroRight: ["I turn ideas into clear,", "engaging digital experiences."],
    aboutTitle: [
      ["I BUILD", "EXPERIENCES,"],
      ["EXPLORE", "IDEAS,"],
      ["SOLVE", "PROBLEMS."],
    ],
    aboutLabel: "I build experiences, explore ideas, solve problems.",
    about: [
      "I’m a software developer who enjoys turning complex ideas into clear, useful digital experiences. I care about the details that make a product intuitive and enjoyable to use.",
      "My interests bring design and development together. I like building responsive interfaces, exploring new technologies, and finding practical solutions to real problems.",
      "Outside of coding, I enjoy gaming, anime, and time with friends. They keep me curious about how stories, systems, and interactions shape an experience.",
      "I’m always learning and building. I’m open to opportunities to collaborate on projects where I can contribute and keep growing.",
    ],
    toolTitles: ["Frontend Tools", "Backend Tools", "UI Libraries"],
    projectsTitle: "My Projects",
    projectsSubtitle:
      "A selection of projects where I explore useful ideas, build thoughtful interfaces, and solve practical problems.",
    projectDescriptions: [
      "A trading simulator that processes orders in real time and presents market activity through a clear, responsive dashboard.",
      "A digital interface designed to bring connected home controls and everyday services into one simple experience.",
      "A tool for organizing job applications and simplifying repetitive steps throughout the search process.",
    ],
    projectTags: [
      ["JavaScript", "Real-time Data", "Trading Engine"],
      ["React", "Responsive UI", "Frontend"],
      ["Automation", "JavaScript", "Productivity"],
    ],
    mockupLabels: ["TRADING SIMULATOR", "BEHOME", "JOB APPLICATION BOT"],
    portraitAlt: "Illustrated portrait of Federico Cresci",
    toolTitles: ["Frontend", "Backend and Data", "Other Languages"],
    toolDescriptions: [
      "I’ve worked with HTML, CSS, JavaScript, and Angular. I’m also familiar with Tailwind CSS, Bootstrap, and jQuery.",
      "I’ve worked with Node.js, Java, Java EE, Spring, Firebase, and SQL.",
      "I’ve also used Python and Swift.",
    ],
  },

  it: {
    pageTitle: "Federico Cresci | Sviluppatore software",
    intro: ["Curioso,", "Creativo,", "Autentico."],
    contact: "Contattami",
    projectsLink: "Progetti",
    heroBefore: "Sono uno ",
    heroLink: "sviluppatore software",
    heroAfter: " in Italia, aperto a nuove opportunità.",
    heroRight: [
      "Trasformo idee in esperienze digitali",
      "chiare e coinvolgenti.",
    ],
    aboutTitle: [
      ["CREO", "ESPERIENZE,"],
      ["ESPLORO", "IDEE,"],
      ["RISOLVO", "PROBLEMI."],
    ],
    aboutLabel: "Creo esperienze, esploro idee, risolvo problemi.",
    about: [
      "Sono uno sviluppatore software e mi piace trasformare idee complesse in esperienze digitali chiare e utili. Curo i dettagli che rendono un prodotto intuitivo e piacevole da usare.",
      "I miei interessi uniscono design e sviluppo. Mi piace creare interfacce responsive, esplorare nuove tecnologie e trovare soluzioni pratiche a problemi reali.",
      "Fuori dal codice mi piacciono i videogiochi, gli anime e il tempo trascorso con gli amici. Sono passioni che alimentano la mia curiosità per storie, sistemi e interazioni.",
      "Continuo a imparare e a costruire nuovi progetti. Sono aperto a collaborazioni in cui posso contribuire e continuare a crescere.",
    ],
    toolTitles: ["Strumenti frontend", "Strumenti backend", "Librerie UI"],
    projectsTitle: "I miei progetti",
    projectsSubtitle:
      "Una selezione di progetti in cui esploro idee utili, curo le interfacce e cerco soluzioni a problemi concreti.",
    projectDescriptions: [
      "Un simulatore di trading che elabora ordini in tempo reale e mostra l’attività di mercato in una dashboard chiara e responsive.",
      "Un’interfaccia digitale pensata per riunire la gestione della casa connessa e i servizi quotidiani in un’unica esperienza semplice.",
      "Uno strumento per organizzare le candidature e semplificare le attività ripetitive durante la ricerca di lavoro.",
    ],
    projectTags: [
      ["JavaScript", "Dati in tempo reale", "Motore di trading"],
      ["React", "Interfaccia responsive", "Frontend"],
      ["Automazione", "JavaScript", "Produttività"],
    ],
    mockupLabels: ["SIMULATORE DI TRADING", "BEHOME", "BOT PER LE CANDIDATURE"],
    portraitAlt: "Ritratto illustrato di Federico Cresci",
    toolTitles: ["Frontend", "Backend e dati", "Altri linguaggi"],
    toolDescriptions: [
      "Ho lavorato con HTML, CSS, JavaScript e Angular. Ho anche familiarità con Tailwind CSS, Bootstrap e jQuery.",
      "Ho lavorato con Node.js, Java, Java EE, Spring, Firebase e SQL.",
      "Ho utilizzato anche Python e Swift.",
    ],
  },
};

const language = (navigator.language || "en").toLowerCase().startsWith("it")
  ? "it"
  : "en";
const copy = translations[language];

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setTextList(selector, values) {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] !== undefined) {
      element.textContent = values[index];
    }
  });
}

function setTextAroundChild(element, before, after) {
  if (!element) return;

  const textNodes = [...element.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE,
  );

  if (textNodes[0]) textNodes[0].textContent = before;
  if (textNodes.length > 1) {
    textNodes[textNodes.length - 1].textContent = after;
  }
}

function localizePortfolio() {
  document.documentElement.lang = language;
  document.title = copy.pageTitle;

  setTextList(".intro__word", copy.intro);
  setText(".hero__button", copy.contact);
  setText(".hero__links .hero__link:first-child", copy.projectsLink);

  const descriptions = document.querySelectorAll(".hero__description");
  setTextAroundChild(descriptions[0], copy.heroBefore, copy.heroAfter);
  const heroLink = descriptions[0]?.querySelector("a");
  if (heroLink) heroLink.textContent = copy.heroLink;

  setTextAroundChild(descriptions[1], copy.heroRight[0], copy.heroRight[1]);

  const aboutTitle = document.querySelector(".about__title");
  aboutTitle?.setAttribute("aria-label", copy.aboutLabel);

  document.querySelectorAll(".about__title-line").forEach((line, index) => {
    const [firstPart, animatedPart] = copy.aboutTitle[index];
    line.firstChild.textContent = `\n            ${firstPart}\n            `;
    line.querySelector(".type-word").dataset.type = animatedPart;
  });

  setTextList(".about__description p", copy.about);

  document
    .querySelectorAll(".about__tool-group .type-word")
    .forEach((element, index) => {
      element.dataset.type = copy.toolTitles[index];
    });
  setTextList(".about__tool-group p", copy.toolDescriptions);

  setText(".projects__title", copy.projectsTitle);
  setText(".projects__subtitle", copy.projectsSubtitle);
  setTextList(".project-card__description", copy.projectDescriptions);

  document.querySelectorAll(".project-card").forEach((card, index) => {
    card.querySelectorAll(".project-card__tags li").forEach((tag, tagIndex) => {
      tag.textContent = copy.projectTags[index][tagIndex];
    });

    card
      .querySelector(".project-card__screen")
      ?.setAttribute("data-label", copy.mockupLabels[index]);
  });

  document
    .querySelector(".hero__portrait img")
    ?.setAttribute("alt", copy.portraitAlt);
}

localizePortfolio();

window.translatePortfolioTooltip = (text) => {
  if (text.startsWith("Guarda i miei progett")) {
    return language === "it" ? "Guarda i miei progetti" : "View my projects";
  }

  if (text.toLowerCase().includes("linkedin")) {
    return language === "it" ? "Guarda il mio LinkedIn" : "View my LinkedIn";
  }

  return text;
};
