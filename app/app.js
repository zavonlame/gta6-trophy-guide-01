// Leonida Platinum — GTA 6 trophy tracker.
// Own code, written for this entry. Loads app/data/trophies.json at run time,
// keeps the checklist in localStorage, and renders tracker, roadmap and
// missable views. Makes no network requests of its own.

const DATA_URL = "data/trophies.json";
const STORE_KEY = "leonida-platinum-earned-v1";
const SPOILER_KEY = "leonida-platinum-spoiler-v1";

const STAGES = [
  { n: 1, title: "Stage 1 — Play the story", note: "Chapters 1–4, the final mission, and the six named story missions (Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown, Operation Savage Glory). Play in order; story missions can be replayed, so none of these can be missed." },
  { n: 2, title: "Stage 2 — Strangers & Freaks", note: "The stranger strands (Andy, Kenton, Billy, Randy, Tyrone) plus any three more strands for the silver. Do the two choice and retry trophies here too — Actions Speak Louder and Bad Luck, I Guess — and the Ocean Beach cocktail, In The Beginning…, while they are in front of you." },
  { n: 3, title: "Stage 3 — Activities & challenges", note: "Stunts, the shooting range, races, fishing, the arcade, meditation, hunting, bowling and the 50 challenges. Sample every activity type early for Master of None, then grind the counts (250 stunts, gold in all 42 range challenges) between story beats." },
  { n: 4, title: "Stage 4 — Collectibles & exploration", note: "Card sets, WAiNK spots, vehicles, the whole map of Leonida, garage properties and the Scooter Bros app. Collect as you explore and sweep the remainder with the map once the story is done. The Truth Is Out There belongs here too — follow anything odd you see." },
  { n: 5, title: "Stage 5 — Crime & combat", note: "Wanted levels, shop and bank robberies, Combat Focus, the armored truck, the gangs' illegal operations — and the two one-time moments to treat as missable: the unscheduled departure at VCIA and the showroom smash." },
  { n: 6, title: "Stage 6 — Money & 100%", note: "Launder $250,000 of Marked Bills, spend $100,000 across all shops, and push the in-game completion stat to 100% for A Long Road. The platinum, Vice Got a Price!, unlocks the moment the 54th trophy lands." },
];

const KIND_LABELS = {
  story: "Story", strangers: "Strangers", activities: "Activities",
  collectibles: "Collectibles", combat: "Combat & crime", misc: "Everything else",
  completion: "100% completion", platinum: "Platinum",
};

let trophies = [];
let earned = new Set();
let selectedId = null;
let spoilerOn = false;

const $ = (id) => document.getElementById(id);

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCounts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] += 1;
  return counts;
}

function updateProgress() {
  const n = earned.size;
  const total = trophies.length;
  $("progressText").textContent = `${n} of ${total} earned`;
  $("progressBar").style.width = total ? `${Math.round((n / total) * 100)}%` : "0%";
  const c = gradeCounts();
  $("gradeCounts").textContent =
    `Platinum ${c.platinum}/1 · Gold ${c.gold}/2 · Silver ${c.silver}/6 · Bronze ${c.bronze}/46`;
}

function trophyHiddenBySpoiler(t) {
  return spoilerOn && t.kind === "story" && !earned.has(t.id);
}

function visibleTrophies() {
  const q = $("search").value.trim().toLowerCase();
  const grade = $("gradeFilter").value;
  const kind = $("kindFilter").value;
  const missableOnly = $("missableOnly").checked;
  const hideEarned = $("hideEarned").checked;
  return trophies.filter((t) => {
    if (grade !== "all" && t.grade !== grade) return false;
    if (kind !== "all" && t.kind !== kind) return false;
    if (missableOnly && !t.missable) return false;
    if (hideEarned && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList() {
  const list = $("trophyList");
  const shown = visibleTrophies();
  list.innerHTML = "";
  $("listCount").textContent =
    shown.length === trophies.length
      ? `Showing all ${trophies.length} trophies.`
      : `Showing ${shown.length} of ${trophies.length} trophies.`;
  for (const t of shown) {
    const li = document.createElement("li");
    li.className = "trophy" + (earned.has(t.id) ? " is-earned" : "") + (selectedId === t.id ? " is-selected" : "");
    const hidden = trophyHiddenBySpoiler(t);

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", `Mark ${t.name} as earned`);
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      updateProgress();
      renderList();
      renderRoadmap();
      renderMissables();
      if (selectedId === t.id) renderGuidePane();
    });

    const body = document.createElement("div");
    const name = document.createElement("div");
    name.className = "trophy-name";
    name.textContent = hidden ? "Hidden trophy — earn it to reveal" : t.name;
    const desc = document.createElement("div");
    desc.className = hidden ? "spoiler-note" : "trophy-desc";
    desc.textContent = hidden
      ? "A story trophy. Turn off “Hide story spoilers” to see its name and description."
      : t.description;
    const tags = document.createElement("div");
    tags.className = "trophy-tags";
    const kindTag = document.createElement("span");
    kindTag.className = "tag";
    kindTag.textContent = KIND_LABELS[t.kind] || t.kind;
    tags.append(kindTag);
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "tag missable";
      m.textContent = "Treat as missable";
      tags.append(m);
    }
    if (hidden) {
      const s = document.createElement("span");
      s.className = "tag spoiler-hidden";
      s.textContent = "Spoiler hidden";
      tags.append(s);
    }
    const guideBtn = document.createElement("button");
    guideBtn.type = "button";
    guideBtn.className = "guide-btn";
    guideBtn.textContent = hidden ? "Why is this hidden?" : "Read the guide";
    guideBtn.addEventListener("click", () => {
      selectedId = t.id;
      renderList();
      renderGuidePane();
      $("guidePane").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    body.append(name, desc, tags, guideBtn);

    const badge = document.createElement("span");
    badge.className = `grade-badge grade-${t.grade}`;
    badge.textContent = t.grade;

    li.append(box, body, badge);
    list.append(li);
  }
  if (shown.length === 0) {
    const li = document.createElement("li");
    li.className = "trophy";
    li.textContent = "No trophies match these filters. Clear the search or a filter to see more.";
    list.append(li);
  }
}

function renderGuidePane() {
  const pane = $("guidePane");
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    pane.innerHTML = `<p class="guide-empty">Select a trophy to read its guide.</p>`;
    return;
  }
  pane.innerHTML = "";
  const hidden = trophyHiddenBySpoiler(t);
  const h = document.createElement("h3");
  h.textContent = hidden ? "Hidden story trophy" : t.name;
  const badge = document.createElement("span");
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  const desc = document.createElement("p");
  desc.className = "trophy-desc";
  desc.textContent = hidden
    ? "Its name and description are hidden until you earn it — turn off “Hide story spoilers” to see them."
    : t.description;
  pane.append(h, badge, desc);
  if (t.missable && t.missableNote) {
    const callout = document.createElement("p");
    callout.className = "missable-callout";
    callout.textContent = `Missable: ${t.missableNote}`;
    pane.append(callout);
  }
  if (!hidden) {
    const guide = document.createElement("p");
    guide.className = "guide-text";
    guide.textContent = t.guide;
    pane.append(guide);
  }
  const sources = document.createElement("div");
  sources.className = "sources";
  const title = document.createElement("strong");
  title.textContent = "Sources";
  sources.append(title);
  const ul = document.createElement("ul");
  for (const s of t.sources || []) {
    const li = document.createElement("li");
    if (s.url) {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.label;
      li.append(a);
    } else {
      li.textContent = s.label;
    }
    ul.append(li);
  }
  sources.append(ul);
  pane.append(sources);
}

function renderRoadmap() {
  const list = $("roadmapList");
  list.innerHTML = "";
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n);
    const li = document.createElement("li");
    li.className = "stage";
    const h = document.createElement("h3");
    h.innerHTML = "";
    h.append(document.createTextNode(stage.title + " "));
    const count = document.createElement("span");
    count.className = "stage-count";
    count.textContent = `(${members.filter((t) => earned.has(t.id)).length}/${members.length} earned)`;
    h.append(count);
    const note = document.createElement("p");
    note.textContent = stage.note;
    const ul = document.createElement("ul");
    for (const t of members) {
      const item = document.createElement("li");
      if (earned.has(t.id)) item.className = "is-earned";
      const flag = t.missable ? " — treat as missable" : "";
      item.textContent = `${t.name} (${t.grade})${flag}`;
      ul.append(item);
    }
    li.append(h, note, ul);
    list.append(li);
  }
}

function renderMissables() {
  const list = $("missableList");
  list.innerHTML = "";
  for (const t of trophies.filter((x) => x.missable)) {
    const li = document.createElement("li");
    li.className = "missable-card";
    const h = document.createElement("h3");
    h.textContent = t.name;
    const badge = document.createElement("span");
    badge.className = `grade-badge grade-${t.grade}`;
    badge.textContent = t.grade;
    const callout = document.createElement("p");
    callout.className = "missable-callout";
    callout.textContent = t.missableNote || "Treat as missable.";
    const guide = document.createElement("p");
    guide.textContent = t.guide;
    const state = document.createElement("p");
    state.textContent = earned.has(t.id) ? "Earned — nice, this one is safe." : "Not earned yet.";
    li.append(h, badge, callout, guide, state);
    list.append(li);
  }
}

function showView(name) {
  for (const btn of document.querySelectorAll(".tab")) {
    btn.classList.toggle("is-active", btn.dataset.view === name);
  }
  for (const section of document.querySelectorAll(".view")) {
    section.classList.toggle("is-visible", section.id === `${name}View`);
  }
  if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
}

function exportProgress() {
  const payload = {
    guide: "Leonida Platinum — GTA 6 trophy progress",
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-platinum-progress.json";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      const valid = new Set(trophies.map((t) => t.id));
      const next = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
      earned = next;
      saveEarned();
      updateProgress();
      renderList();
      renderRoadmap();
      renderMissables();
      renderGuidePane();
    } catch {
      alert("That file is not a Leonida Platinum progress export.");
    }
  };
  reader.readAsText(file);
}

async function init() {
  earned = loadEarned();
  spoilerOn = localStorage.getItem(SPOILER_KEY) === "1";
  $("spoilerToggle").checked = spoilerOn;
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = Array.isArray(data) ? data : data.trophies;
  trophies.sort((a, b) => a.id - b.id);

  for (const id of ["search", "gradeFilter", "kindFilter", "missableOnly", "hideEarned"]) {
    $(id).addEventListener("input", renderList);
  }
  $("spoilerToggle").addEventListener("change", () => {
    spoilerOn = $("spoilerToggle").checked;
    localStorage.setItem(SPOILER_KEY, spoilerOn ? "1" : "0");
    renderList();
    renderGuidePane();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importFile").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  for (const btn of document.querySelectorAll(".tab")) {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selectedId !== null) {
      selectedId = null;
      renderList();
      renderGuidePane();
    }
    if (e.key === "/" && document.activeElement !== $("search")) {
      e.preventDefault();
      $("search").focus();
    }
  });

  const hash = location.hash.replace("#", "");
  showView(["tracker", "roadmap", "missables"].includes(hash) ? hash : "tracker");
  updateProgress();
  renderList();
  renderRoadmap();
  renderMissables();
  renderGuidePane();
}

init();
