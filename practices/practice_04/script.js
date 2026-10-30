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

// ===== Feature 001: Favorites (logic + UI integration) =====
const STORAGE_KEY = "shelter.catalog.favorites";
let favoritesSet = new Set();
let storagePersisted = true; // reflects last successful storage sync
let storageWarned = false; // UI one-time warning for storage unavailable
let corruptedRecovered = false; // flag to announce recovery once
let storageInitError = false; // flag to announce storage unavailability after first render

function readFavoritesFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      storagePersisted = true;
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Parsed but not an array → treat as corrupted
      favoritesSet = new Set();
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        storagePersisted = true;
        corruptedRecovered = true;
      } catch (w) {
        storagePersisted = false;
        storageInitError = true;
      }
      return [];
    } catch (e) {
      // corrupted JSON: reset to []
      favoritesSet = new Set();
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        storagePersisted = true;
        corruptedRecovered = true;
      } catch (w) {
        storagePersisted = false;
        storageInitError = true;
      }
      return [];
    }
  } catch (e) {
    // Storage unavailable
    storagePersisted = false;
    storageInitError = true;
    return [];
  }
}

function writeFavoritesToStorage(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    storagePersisted = true;
    return true;
  } catch (e) {
    storagePersisted = false;
    return false;
  }
}

function validateAndNormalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  const validIdsSet = new Set(animals.map((a) => a.id));
  const next = [];
  const seen = new Set();
  for (const v of ids) {
    if (typeof v !== "string") continue;
    if (v.length === 0) continue;
    if (!validIdsSet.has(v)) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    next.push(v);
  }
  return next;
}

function initFavorites() {
  const rawIds = readFavoritesFromStorage();
  const normalized = validateAndNormalizeIds(rawIds);
  favoritesSet = new Set(normalized);
  // corrective write when differs
  if (storagePersisted && Array.isArray(rawIds)) {
    if (rawIds.length !== normalized.length || rawIds.some((x, i) => normalized[i] !== x)) {
      writeFavoritesToStorage(normalized);
    }
  }
}

function getFavoritesState() {
  return {
    favoritesIds: Array.from(favoritesSet),
    favoritesCount: favoritesSet.size,
    persisted: storagePersisted,
  };
}

function isFavorite(animalId) {
  return favoritesSet.has(animalId);
}

function addFavorite(animalId) {
  if (!animals.some((a) => a.id === animalId)) {
    return { ok: false, code: "UNKNOWN_ID", persisted: storagePersisted };
  }
  if (favoritesSet.has(animalId)) {
    return {
      ok: true,
      changed: false,
      isFavorite: true,
      favoritesIds: Array.from(favoritesSet),
      favoritesCount: favoritesSet.size,
      persisted: storagePersisted,
      code: "OK_NOOP",
    };
  }
  favoritesSet.add(animalId);
  const ids = Array.from(favoritesSet);
  const persisted = writeFavoritesToStorage(ids);
  return {
    ok: true,
    changed: true,
    isFavorite: true,
    favoritesIds: ids,
    favoritesCount: ids.length,
    persisted,
    code: persisted ? undefined : "STORAGE_UNAVAILABLE",
    message: persisted ? undefined : "Избранные не сохранятся после перезагрузки.",
  };
}

function removeFavorite(animalId) {
  if (!favoritesSet.has(animalId)) {
    return {
      ok: true,
      changed: false,
      isFavorite: false,
      favoritesIds: Array.from(favoritesSet),
      favoritesCount: favoritesSet.size,
      persisted: storagePersisted,
      code: "OK_NOOP",
    };
  }
  favoritesSet.delete(animalId);
  const ids = Array.from(favoritesSet);
  const persisted = writeFavoritesToStorage(ids);
  return {
    ok: true,
    changed: true,
    isFavorite: false,
    favoritesIds: ids,
    favoritesCount: ids.length,
    persisted,
    code: persisted ? undefined : "STORAGE_UNAVAILABLE",
    message: persisted ? undefined : "Избранные не сохранятся после перезагрузки.",
  };
}

function toggleFavorite(animalId) {
  if (!animals.some((a) => a.id === animalId)) {
    const ids = Array.from(favoritesSet);
    return {
      ok: false,
      changed: false,
      isFavorite: false,
      favoritesIds: ids,
      favoritesCount: ids.length,
      persisted: storagePersisted,
      code: "UNKNOWN_ID",
    };
  }
  const currentlyFav = favoritesSet.has(animalId);
  const result = currentlyFav ? removeFavorite(animalId) : addFavorite(animalId);
  return result;
}

function favoriteAriaLabel(name, fav) {
  return fav ? `Убрать из избранного: ${name}` : `Добавить в избранное: ${name}`;
}

function announce(message) {
  const live = document.getElementById("fav-live");
  if (live) {
    live.textContent = message;
  }
}

let favoritesOnly = false; // UI-owned

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
  const meetBtn = createTextElement("button", "meet-button", `Познакомиться с ${animal.name}`);
  meetBtn.type = "button";
  meetBtn.dataset.action = "meet";
  meetBtn.dataset.animalId = animal.id;

  // Favorites button (UI button; safe DOM API)
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.setAttribute("data-favorite-btn", "");
  favBtn.dataset.animalId = animal.id;
  const fav = isFavorite(animal.id);
  favBtn.setAttribute("aria-pressed", String(fav));
  favBtn.setAttribute("aria-label", favoriteAriaLabel(animal.name, fav));
  // Icon + text spans for better control
  const icon = document.createElement("span");
  icon.className = "fav-btn__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = fav ? "♥" : "♡";
  const text = document.createElement("span");
  text.className = "fav-btn__text";
  text.textContent = fav ? "В избранном" : "В избранное";
  favBtn.append(icon, text);

  // Insert favorites button near title for prominence
  // Create a small container for actions
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(favBtn);

  body.append(meta, title, actions, description, meetBtn);
  article.append(image, body);
  return article;
}

function renderAnimals(filter = "all") {
  const animalList = document.querySelector("#animal-list");
  const emptyState = document.querySelector("#empty-state");
  const searchInput = document.querySelector("#pet-search");
  const query = ((searchInput && searchInput.value) || "").trim().toLowerCase();

  // AND-pipeline: favoritesOnly → species → search(name)
  const base = favoritesOnly ? animals.filter((a) => favoritesSet.has(a.id)) : animals;
  const bySpecies = filterAnimals(base, filter);
  const filteredAnimals = query
    ? bySpecies.filter((animal) => animal.name.toLowerCase().includes(query))
    : bySpecies;

  const fragment = document.createDocumentFragment();
  filteredAnimals.forEach((animal) => fragment.append(createAnimalCard(animal)));
  // focus restoration anchor
  const activeBtn = document.activeElement && document.activeElement.closest('[data-favorite-btn]');
  const activeFavId = activeBtn ? activeBtn.dataset.animalId : null;
  animalList.replaceChildren(fragment);

  const emptyByFavorites = favoritesOnly && filteredAnimals.length === 0;
  const noResults = !favoritesOnly && filteredAnimals.length === 0;
  const showEmpty = emptyByFavorites || noResults;
  emptyState.hidden = !showEmpty;
  const emptyCta = document.getElementById("empty-state-cta");
  if (emptyByFavorites) {
    emptyState.textContent = "Нет избранных";
    if (emptyCta) {
      emptyCta.hidden = false;
    }
  } else if (noResults) {
    emptyState.textContent = "По выбранному фильтру питомцев пока нет";
    if (emptyCta) {
      emptyCta.hidden = true;
    }
  } else {
    if (emptyCta) emptyCta.hidden = true;
  }

  // restore focus if possible
  if (activeFavId) {
    const nextBtn = document.querySelector(`[data-favorite-btn][data-animal-id="${activeFavId}"]`);
    if (nextBtn) {
      nextBtn.focus();
    } else {
      const toggle = document.getElementById("favorites-only-toggle");
      (toggle || searchInput || animalList).focus?.();
    }
  }
}

function setActiveFilter(filter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderAnimals(filter);
}

function getActiveFilter() {
  const active = document.querySelector('.filter-button[aria-pressed="true"], .filter-button.is-active');
  return active ? active.dataset.filter : "all";
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
  initFavorites();
  populatePetSelect();
  updateCounters();
  renderAnimals();
  // One-time init storage failure notice
  if (!storageWarned && storageInitError) {
    announce("Избранные не сохранятся после перезагрузки.");
    storageWarned = true;
    storageInitError = false;
  }

  document.querySelector(".filter-group").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");

    if (button) {
      setActiveFilter(button.dataset.filter);
    }
  });

  const list = document.querySelector("#animal-list");
  list.addEventListener("click", (event) => {
    const meet = event.target.closest('[data-action="meet"]');
    if (meet) {
      openApplication(meet.dataset.animalId);
      return;
    }
    const favBtn = event.target.closest('[data-favorite-btn]');
    if (favBtn) {
      const id = favBtn.dataset.animalId;
      const result = toggleFavorite(id);
      if (!result.ok) {
        // do not change UI
        return;
      }
      // aria updates and label announcement
      const animal = animals.find((a) => a.id === id);
      if (animal) {
        announce(result.isFavorite ? `${animal.name} добавлен(а) в избранное.` : `${animal.name} удалён(а) из избранного.`);
      }
      if (result.persisted === false && !storageWarned && result.code === "STORAGE_UNAVAILABLE") {
        announce("Избранные не сохранятся после перезагрузки.");
        storageWarned = true;
      }
      // re-render with current active species filter
      const filter = getActiveFilter();
      renderAnimals(filter);
    }
  });

  const search = document.querySelector("#pet-search");
  if (search) {
    search.addEventListener("input", () => {
      const filter = getActiveFilter();
      renderAnimals(filter);
    });
  }

  const favToggle = document.getElementById("favorites-only-toggle");
  if (favToggle) {
    favToggle.addEventListener("change", () => {
      favoritesOnly = favToggle.checked;
      const filter = getActiveFilter();
      renderAnimals(filter);
    });
  }

  const emptyCta = document.getElementById("empty-state-cta");
  if (emptyCta) {
    emptyCta.addEventListener("click", () => {
      const favT = document.getElementById("favorites-only-toggle");
      if (favT) favT.checked = false;
      favoritesOnly = false;
      const filter = getActiveFilter();
      renderAnimals(filter);
    });
  }

  if (corruptedRecovered) {
    announce("Список избранных восстановлен.");
    corruptedRecovered = false; // announce once
  }
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
  module.exports = { animals, filterAnimals, validateApplication, validateEmail, validatePhone, initFavorites, getFavoritesState, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
