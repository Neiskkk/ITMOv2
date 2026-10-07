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

// ===== Feature 2: Application form =====

function getFormElements() {
  const form = document.querySelector("#application-form");
  return {
    form,
    pet: form.querySelector("#pet-select"),
    name: form.querySelector("#applicant-name"),
    phone: form.querySelector("#applicant-phone"),
    email: form.querySelector("#applicant-email"),
    comment: form.querySelector("#applicant-comment"),
    consent: form.querySelector("#applicant-consent"),
  };
}

function fieldErrorElement(field) {
  const describedBy = field.getAttribute("aria-describedby");
  return describedBy ? document.getElementById(describedBy) : null;
}

function showFieldError(field, message) {
  const errorEl = fieldErrorElement(field);
  if (errorEl) {
    errorEl.textContent = message;
  }
  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field) {
  const errorEl = fieldErrorElement(field);
  if (errorEl) {
    errorEl.textContent = "";
  }
  field.removeAttribute("aria-invalid");
}

function validateEmail(value) {
  // Very basic email validation
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
  return emailRe.test(value);
}

function validatePhone(value) {
  const digits = (value.match(/\d/g) || []).length;
  // Allowed chars are checked by replace; ensure only valid characters
  const cleaned = value.replace(/[\d\s+\-()]/g, "");
  const hasOnlyAllowed = cleaned.length === 0;
  return hasOnlyAllowed && digits >= 10;
}

function validateApplication(formData) {
  const errors = {};

  // pet: required and must exist in animals
  const pet = (formData.pet || "").trim();
  if (!pet) {
    errors.pet = "Пожалуйста, выберите питомца";
  } else if (!animals.some((a) => a.id === pet)) {
    errors.pet = "Выбран неверный питомец";
  }

  // name: 2..60 after trim
  const name = (formData.name || "").trim();
  if (!name) {
    errors.name = "Введите имя";
  } else if (name.length < 2 || name.length > 60) {
    errors.name = "Имя должно быть от 2 до 60 символов";
  }

  const phone = (formData.phone || "").trim();
  const email = (formData.email || "").trim();

  if (!phone && !email) {
    errors.phone = "Укажите телефон или email";
    errors.email = "Укажите телефон или email";
  } else {
    if (phone) {
      if (!validatePhone(phone)) {
        errors.phone = "Проверьте номер телефона (не менее 10 цифр)";
      }
    }
    if (email) {
      if (!validateEmail(email)) {
        errors.email = "Некорректный email";
      }
    }
  }

  const comment = (formData.comment || "").trim();
  if (comment.length > 500) {
    errors.comment = "Комментарий не должен превышать 500 символов";
  }

  if (!formData.consent) {
    errors.consent = "Поставьте галочку согласия";
  }

  return errors;
}

function handleApplicationSubmit(event) {
  event.preventDefault();
  const { form, pet, name, phone, email, comment, consent } = getFormElements();

  // Clear previous errors
  [pet, name, phone, email, comment, consent].forEach(clearFieldError);

  const formData = {
    pet: pet.value,
    name: name.value,
    phone: phone.value,
    email: email.value,
    comment: comment.value,
    consent: consent.checked,
  };

  const errors = validateApplication(formData);

  // Additional native + JS email validation (Constraint Validation API + custom)
  if (formData.email.trim()) {
    if (email.validity.typeMismatch || !validateEmail(formData.email)) {
      errors.email = "Некорректный email";
    }
  }

  const firstInvalid = [];
  Object.entries(errors).forEach(([key, message]) => {
    const field = ({ pet, name, phone, email, comment, consent })[key];
    if (field) {
      showFieldError(field, message);
      firstInvalid.push(field);
    }
  });

  if (firstInvalid.length > 0) {
    firstInvalid[0].focus();
    return;
  }

  // success: no network request
  const status = document.querySelector("#application-status");
  status.textContent = "Заявка принята. Мы свяжемся с вами";

  // clear personal fields, keep selected pet
  name.value = "";
  phone.value = "";
  email.value = "";
  comment.value = "";
  consent.checked = false;

  // move focus to status for feedback, then back to name for convenience
  status.focus?.();
}

function initializeApplicationForm() {
  const { form, name, phone, email, comment, consent, pet } = getFormElements();
  if (!form) return;

  form.addEventListener("submit", handleApplicationSubmit);

  // Clear field error on input/change
  [name, phone, email, comment].forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
  });
  [pet, consent].forEach((el) => {
    el.addEventListener("change", () => clearFieldError(el));
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeCatalog();
    initializeApplicationForm();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { animals, filterAnimals, validateApplication, validateEmail, validatePhone };
}
