const animals = [
  {
    id: "busya",
    name: "Буся",
    species: "cat",
    age: "2 года",
    sex: "девочка",
    image: "assets/images/busya.svg",
    alt: "Рыжая кошка Буся на синем фоне",
    description: "Любит наблюдать за людьми, играть с лентами и первой встречает гостей."
  },
  {
    id: "martin",
    name: "Мартин",
    species: "dog",
    age: "4 года",
    sex: "мальчик",
    image: "assets/images/martin.svg",
    alt: "Пёс Мартин на жёлтом фоне",
    description: "Спокойный компаньон для долгих прогулок, который отлично знает поводок."
  },
  {
    id: "luna",
    name: "Луна",
    species: "cat",
    age: "1 год",
    sex: "девочка",
    image: "assets/images/luna.svg",
    alt: "Серая кошка Луна на зелёном фоне",
    description: "Осторожная в начале знакомства, зато потом приходит спать рядом."
  },
  {
    id: "archie",
    name: "Арчи",
    species: "dog",
    age: "3 года",
    sex: "мальчик",
    image: "assets/images/archie.svg",
    alt: "Пятнистый пёс Арчи на голубом фоне",
    description: "Энергичный исследователь, любит мячики, команды и активные выходные."
  },
  {
    id: "sonya",
    name: "Соня",
    species: "cat",
    age: "5 лет",
    sex: "девочка",
    image: "assets/images/sonya.svg",
    alt: "Чёрная кошка Соня на розовом фоне",
    description: "Самостоятельная и тактичная кошка, ценит тишину и мягкие пледы."
  },
  {
    id: "peach",
    name: "Персик",
    species: "dog",
    age: "8 месяцев",
    sex: "мальчик",
    image: "assets/images/peach.svg",
    alt: "Щенок Персик на фиолетовом фоне",
    description: "Любознательный щенок: быстро учится, смешно спит и дружит со всеми."
  }
];

const speciesLabels = {
  cat: "кошка",
  dog: "собака"
};

function filterAnimals(source, filter) {
  if (filter === "all") {
    return [...source];
  }

  if (!Object.hasOwn(speciesLabels, filter)) {
    return [];
  }

  return source.filter((animal) => animal.species === filter);
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createAnimalCard(animal) {
  const article = document.createElement("article");
  article.className = "animal-card";
  article.dataset.animalId = animal.id;

  const image = document.createElement("img");
  image.className = "animal-photo";
  image.src = animal.image;
  image.alt = animal.alt;
  image.width = 640;
  image.height = 480;
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "animal-body";

  const meta = document.createElement("p");
  meta.className = "animal-meta";
  meta.append(
    createTextElement("span", "", speciesLabels[animal.species]),
    createTextElement("span", "", `${animal.age}, ${animal.sex}`)
  );

  const title = createTextElement("h3", "", animal.name);
  const description = createTextElement("p", "animal-description", animal.description);
  const button = createTextElement("button", "meet-button", `Познакомиться с ${animal.name}`);
  button.type = "button";
  button.dataset.action = "meet";
  button.dataset.animalId = animal.id;

  body.append(meta, title, description, button);
  article.append(image, body);
  return article;
}

function renderAnimals(filter = "all") {
  const animalList = document.querySelector("#animal-list");
  const emptyState = document.querySelector("#empty-state");
  const filteredAnimals = filterAnimals(animals, filter);
  const fragment = document.createDocumentFragment();

  filteredAnimals.forEach((animal) => fragment.append(createAnimalCard(animal)));
  animalList.replaceChildren(fragment);
  emptyState.hidden = filteredAnimals.length !== 0;
}

function setActiveFilter(filter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderAnimals(filter);
}

function openApplication(animalId) {
  const animal = animals.find((item) => item.id === animalId);

  if (!animal) {
    return;
  }

  const section = document.querySelector("#application");
  const status = document.querySelector("#application-status");
  const petSelect = document.querySelector("#pet-select");
  const firstUserInput = document.querySelector("#applicant-name");

  petSelect.value = animal.id;
  status.textContent = `${animal.name} выбран(а). Теперь можно начать заявку на знакомство.`;
  section.dataset.selectedAnimalId = animal.id;
  section.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    firstUserInput.focus({ preventScroll: true });
  }, 400);
}

function populatePetSelect() {
  const petSelect = document.querySelector("#pet-select");
  const fragment = document.createDocumentFragment();

  animals.forEach((animal) => {
    const option = document.createElement("option");
    option.value = animal.id;
    option.textContent = animal.name;
    fragment.append(option);
  });

  petSelect.append(fragment);
}

function updateCounters() {
  const counts = {
    all: animals.length,
    cat: filterAnimals(animals, "cat").length,
    dog: filterAnimals(animals, "dog").length
  };

  Object.entries(counts).forEach(([filter, count]) => {
    const counter = document.querySelector(`[data-count="${filter}"]`);
    counter.textContent = String(count);
  });
}

function initializeCatalog() {
  populatePetSelect();
  updateCounters();
  renderAnimals();

  document.querySelector(".filter-group").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");

    if (button) {
      setActiveFilter(button.dataset.filter);
    }
  });

  document.querySelector("#animal-list").addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="meet"]');

    if (button) {
      openApplication(button.dataset.animalId);
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeCatalog);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { animals, filterAnimals };
}