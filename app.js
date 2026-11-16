// Books 2026: a static, read-only reading log. All data comes from books.json.
const PALETTE = ["#2b3f5c", "#6b2430", "#2f5546", "#8a6a1f", "#3d3550", "#7a3f1d", "#244c5a", "#4f5a2a", "#5a2f44", "#1f3a35", "#6e4f2b", "#34405a"];
const TABS = ["read", "list", "toread"];
const state = { books: [], tab: "read" };

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const readKey = b => b.order ?? b.n ?? 0;
const byId = id => state.books.find(b => b.id === id);

function splitTitle(t) {
  const m = t.match(/^(.+?)(?::\s+|：)(.+)$/);
  return m ? [m[1], m[2]] : [t, ""];
}
function cleanAuthor(a) { return (a || "").replace(/\s*\(.*\)\s*/, ""); }
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function coverHTML(b) {
  const [main] = splitTitle(b.title || "Untitled");
  if (b.cover) return `<div class="cover"><img src="${esc(b.cover)}" alt="" loading="lazy" decoding="async"></div>`;
  const color = PALETTE[((b.n || 1) - 1) % PALETTE.length];
  const cjk = /[㐀-鿿]/.test(main);
  const size = cjk ? 2.1 : main.length < 12 ? 1.55 : main.length < 24 ? 1.22 : 1;
  return `<div class="cover" style="--c:${color}"><div class="t" style="font-size:${size}em">${esc(main)}</div><div class="a">${esc(cleanAuthor(b.author))}</div></div>`;
}
function starsHTML(r) {
  if (r == null) return "";
  let h = "";
  for (let i = 1; i <= 5; i++) h += r >= i ? "★" : r >= i - .5 ? `<span class="half">★</span>` : `<span class="off">★</span>`;
  return `<span class="stars" role="img" aria-label="${r} out of 5">${h}</span>`;
}

function renderStats() {
  const read = state.books.filter(b => b.status === "read");
  const rated = read.filter(b => typeof b.rating === "number");
  const avg = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : "–";
  const pages = read.reduce((s, b) => s + (b.pages || 0), 0);
  $("#stats").innerHTML =
    `<div><b>${read.length}</b>read</div>` +
    `<div><b>${pages.toLocaleString()}</b>pages read</div>` +
    `<div><b>${avg}</b>avg rating</div>` +
    `<div><b>${rated.filter(b => b.rating === 5).length}</b>five-star</div>`;
}

function renderNow() {
  const el = $("#now");
  const cur = state.books.filter(b => b.status === "reading");
  el.hidden = !cur.length;
  el.innerHTML = cur.map(b => {
    const p = b.currentPage || 0, tot = b.pages || 0;
    const pct = tot ? Math.min(100, Math.round(p / tot * 100)) : 0;
    const label = tot ? `Page ${p} of ${tot} · ${pct}%` : p ? `Page ${p}` : "Just started";
    return `<button class="now-card" data-id="${esc(b.id)}">
      ${coverHTML(b)}
      <span style="min-width:0;display:block">
        <span class="now-eye">Currently reading</span>
        <span class="now-t">${esc(splitTitle(b.title)[0])}</span>
        <span class="now-a" style="display:block">${esc(b.author)}</span>
        ${tot ? `<span class="prog" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${p}" style="display:block"><span style="width:${pct}%"></span></span>` : ""}
        <span class="prog-l" style="display:block">${label}</span>
      </span></button>`;
  }).join("");
}

function renderGrid(shelf, books, note) {
  if (!books.length) { shelf.innerHTML = `<p class="empty">Nothing here yet.</p>`; return; }
  shelf.innerHTML = (note ? `<p class="sort-note">${note}</p>` : "") +
    `<div class="grid">${books.map(b => `
      <button class="book" data-id="${esc(b.id)}" aria-label="${esc(b.title)}">
        ${coverHTML(b)}
        <span class="meta">${starsHTML(b.rating) || "<span></span>"}<span>${b.pages ? `${b.pages} pp` : ""}</span></span>
      </button>`).join("")}</div>`;
}

function renderList(shelf) {
  const read = state.books.filter(b => b.status === "read").sort((a, b) => readKey(a) - readKey(b));
  const pages = read.reduce((s, b) => s + (b.pages || 0), 0);
  const rated = read.filter(b => typeof b.rating === "number");
  const avg = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : "–";
  shelf.innerHTML = `<section class="yl">
    <div class="yl-head"><h2>Read in 2026</h2><p>${read.length} books · ${pages.toLocaleString()} pages · ${avg} average</p></div>
    <ol>${read.map((b, i) => {
      const [main, sub] = splitTitle(b.title);
      return `<li><button class="yl-row ${b.rating === 5 ? "fav" : ""}" data-id="${esc(b.id)}">
        <span class="yl-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="yl-c">${b.cover ? `<img src="${esc(b.cover)}" alt="" loading="lazy">` : ""}</span>
        <span style="min-width:0"><span class="yl-t" style="display:block">${esc(main)}</span>${sub ? `<span class="yl-s" style="display:block">${esc(sub)}</span>` : ""}<span class="yl-a" style="display:block">${esc(b.author)}</span></span>
        <span class="yl-r">${starsHTML(b.rating)}<span>${b.pages ? `${b.pages} pp` : ""}</span></span>
      </button></li>`;
    }).join("")}</ol></section>`;
}

function render() {
  renderStats();
  renderNow();
  document.querySelectorAll(".tabs button").forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === state.tab)));
  const shelf = $("#shelf");
  if (state.tab === "list") return renderList(shelf);
  if (state.tab === "read") {
    return renderGrid(shelf, state.books.filter(b => b.status === "read").sort((a, b) => readKey(a) - readKey(b)), "In the order I finished them");
  }
  const pile = state.books.filter(b => b.status === "toread")
    .sort((a, b) => ((a.pages || Infinity) - (b.pages || Infinity)) || (a.n || 0) - (b.n || 0));
  renderGrid(shelf, pile, "Shortest first");
}

function openDetail(id) {
  const b = byId(id); if (!b) return;
  const [main, sub] = splitTitle(b.title);
  const facts = [];
  if (b.status === "reading") facts.push(["Status", b.pages ? `Reading · page ${b.currentPage || 0} of ${b.pages}` : "Reading now"]);
  if (b.status === "toread") facts.push(["Status", "On the to-read pile"]);
  if (b.rating != null) facts.push(["Rating", `${starsHTML(b.rating)} <span style="font-family:var(--f-mono);font-size:12px;color:var(--muted)">${b.rating}/5</span>`]);
  if (b.pages) facts.push(["Pages", b.pages]);
  if (b.finished) facts.push(["Finished", esc(fmtDate(b.finished))]);
  const d = $("#detail");
  d.innerHTML = `<button class="d-close" aria-label="Close">×</button>
    <div class="d-in">${coverHTML(b)}<div style="min-width:0">
      <h2 id="d-title">${esc(main)}</h2>${sub ? `<p class="d-sub">${esc(sub)}</p>` : ""}
      <p class="d-by">${esc(b.author)}</p>
      <dl class="d-facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    </div></div>`;
  d.querySelector(".d-close").onclick = () => d.close();
  d.showModal();
}

function setTab(tab, push) {
  state.tab = TABS.includes(tab) ? tab : "read";
  if (push) history.replaceState(null, "", state.tab === "read" ? location.pathname : "#" + state.tab);
  render();
}

document.querySelector(".tabs").addEventListener("click", e => { const t = e.target.closest("[data-tab]"); if (t) setTab(t.dataset.tab, true); });
document.addEventListener("click", e => { const t = e.target.closest("[data-id]"); if (t) openDetail(t.dataset.id); });
$("#detail").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
window.addEventListener("hashchange", () => setTab(location.hash.slice(1)));

fetch("books.json")
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    state.books = data.books;
    $("#updated").textContent = fmtDate(data.updated);
    setTab(location.hash.slice(1));
  })
  .catch(() => { $("#shelf").innerHTML = `<p class="empty">The book list couldn't load. Refresh the page to try again.</p>`; });
