(function () {
  "use strict";
  const P = window.PLAN;
  const LS_KEY = "q1-plan-state-v1";
  const DEFAULT_CAP = { 0: 90, 1: 150, 2: 150, 3: 150, 4: 150, 5: 150, 6: 150 }; // 0 = domingo
  const SUBJ_ORDER = ["DMIC", "HIPS", "CIAF"];
  const PULL_AHEAD = 4; // días que se puede adelantar una tarea para llenar el día

  // ───────── fechas (siempre YYYY-MM-DD en hora local) ─────────
  const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmt = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return fmt(d); };
  const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
  const todayStr = () => fmt(new Date());
  const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const dayLabel = s => { const d = parseD(s); return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; };
  const hm = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? h + " h " + r + " min" : h + " h") : r + " min"; };
  const hDec = m => (m / 60).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " h";

  // ───────── estado ─────────
  let state = { done: {}, gaps: {}, off: {}, cap: null, updatedAt: 0 };
  const cap = () => Object.assign({}, DEFAULT_CAP, state.cap || {});

  const examOf = (s, ph) => P.EXAMS.find(e => e.subj === s && e.kind === ph);
  const examDates = new Set(P.EXAMS.map(e => e.date));

  // Fecha objetivo de cada tarea: se reparten por igual (según minutos) entre
  // el inicio de su fase y el día antes del examen.
  const TASKS = P.TASKS.map((t, i) => Object.assign({ order: i }, t));
  (function computeTargets() {
    const groups = {};
    TASKS.forEach(t => (groups[t.s + t.ph] = groups[t.s + t.ph] || []).push(t));
    Object.values(groups).forEach(list => {
      const t0 = list[0];
      const start = t0.ph === "P" ? P.START : P.AFTER_MIDTERMS;
      const exam = examOf(t0.s, t0.ph).date;
      const end = addDays(exam, -2); // deja libre el día antes del examen
      const span = Math.max(1, diffDays(start, end) + 1);
      const total = list.reduce((a, t) => a + t.m, 0);
      let cum = 0;
      list.forEach(t => {
        let target = addDays(start, Math.floor((cum / total) * span));
        if (t.due) { const lim = addDays(t.due, -3); if (lim < target) target = lim < start ? start : lim; }
        t.target = target;
        t.deadline = t.due ? addDays(t.due, -1) : addDays(exam, -1);
        cum += t.m;
      });
    });
  })();
  const taskById = Object.fromEntries(TASKS.map(t => [t.id, t]));

  function capacity(day, ignoreOff) {
    if (!ignoreOff && state.off[day]) return 0;
    if (P.HOLIDAYS.includes(day)) return 0;
    const c = cap()[parseD(day).getDay()];
    return examDates.has(day) ? Math.min(c, 60) : c;
  }

  // Reparte las tareas pendientes en días a partir de `from`, sin adelantar
  // ninguna tarea a antes de su fecha objetivo.
  function schedule(from, doneSet, ignoreOff) {
    const pending = TASKS.filter(t => !doneSet.has(t.id))
      .sort((a, b) => (a.target < b.target ? -1 : a.target > b.target ? 1 : a.order - b.order));
    const byDay = {}, dayOf = {};
    let day = from, guard = 0;
    while (pending.length && guard < 500) {
      const c = capacity(day, ignoreOff);
      let used = 0;
      const list = [];
      // 1.º lo que ya toca; 2.º si el día queda corto, adelanta hasta 4 días
      for (const horizon of [day, addDays(day, PULL_AHEAD)]) {
        if (horizon !== day && used >= c * 0.8) break;
        for (let i = 0; i < pending.length && c > 0 && used < c;) {
          const t = pending[i];
          if (t.target > horizon) break;
          if (used > 0 && used + t.m > c + 15) { i++; continue; }
          list.push(t); used += t.m; pending.splice(i, 1);
        }
      }
      if (list.length) { byDay[day] = list; list.forEach(t => (dayOf[t.id] = day)); }
      day = addDays(day, 1); guard++;
    }
    return { byDay, dayOf };
  }

  const baseline = () => schedule(P.START, new Set(), true);

  function doneBefore(day) {
    return new Set(Object.keys(state.done).filter(id => state.done[id] < day));
  }

  function computePace(today) {
    const base = baseline();
    let expectedBefore = 0, expectedThrough = 0;
    Object.entries(base.byDay).forEach(([d, list]) => {
      const m = list.reduce((a, t) => a + t.m, 0);
      if (d < today) expectedBefore += m;
      if (d <= today) expectedThrough += m;
    });
    const done = Object.keys(state.done).reduce((a, id) => a + (taskById[id] ? taskById[id].m : 0), 0);
    return { expectedBefore, expectedThrough, done };
  }

  function projections(today) {
    const sch = schedule(today, new Set(Object.keys(state.done)), false);
    const out = {};
    TASKS.forEach(t => {
      const key = t.s + t.ph;
      const o = out[key] = out[key] || { s: t.s, ph: t.ph, total: 0, done: 0, last: null, late: 0 };
      o.total += t.m;
      if (state.done[t.id]) o.done += t.m;
      else {
        const d = sch.dayOf[t.id];
        if (!o.last || d > o.last) o.last = d;
        if (d > t.deadline) o.late += t.m;
      }
    });
    return out;
  }

  // ───────── guardado: db de la cuenta si existe, si no localStorage ─────────
  const store = { mode: "local", ref: null, writing: false, dirty: false, error: "" };
  function loadLocal() {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) applyState(JSON.parse(raw)); } catch (e) { /* sin almacenamiento */ }
  }
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ } }
  function applyState(s) {
    if (!s || typeof s !== "object") return;
    state = {
      done: s.done && typeof s.done === "object" ? Object.assign({}, s.done) : {},
      gaps: s.gaps && typeof s.gaps === "object" ? Object.assign({}, s.gaps) : {},
      off: s.off && typeof s.off === "object" ? Object.assign({}, s.off) : {},
      cap: s.cap && typeof s.cap === "object" ? Object.assign({}, s.cap) : null,
      updatedAt: Number(s.updatedAt) || 0
    };
  }
  function save() {
    state.updatedAt = Date.now();
    saveLocal();
    render();
    if (store.ref) { store.dirty = true; flush(); }
  }
  async function flush() {
    if (store.writing) return;
    store.writing = true;
    try {
      while (store.dirty) {
        store.dirty = false;
        await store.ref.set(JSON.parse(JSON.stringify(state)));
      }
      store.error = "";
    } catch (e) {
      store.error = (e && e.code) === "quota_exceeded"
        ? "No se pudo sincronizar: la base de datos está llena."
        : "No se pudo sincronizar ahora; tus cambios quedan en este navegador.";
    }
    store.writing = false;
    renderSync();
  }
  async function connectDb() {
    try {
      if (!window.claude || typeof window.claude.use !== "function") return;
      const db = await window.claude.use("db");
      if (!db) return;
      store.ref = db.doc("progress/state");
      store.mode = "sync";
      let first = true;
      store.ref.onSnapshot(snap => {
        if (snap.exists) {
          const remote = snap.data();
          if (first && state.updatedAt > (Number(remote.updatedAt) || 0)) {
            store.dirty = true; flush();
          } else if (!snap.metadata.hasPendingWrites) {
            applyState(remote); saveLocal(); render();
          }
        } else if (first && state.updatedAt) {
          store.dirty = true; flush();
        }
        first = false;
        renderSync();
      }, () => { store.mode = "local"; store.ref = null; renderSync(); });
      renderSync();
    } catch (e) { /* se queda en local */ }
  }

  // ───────── acciones ─────────
  function toggleDone(id) {
    if (state.done[id]) delete state.done[id];
    else state.done[id] = todayStr();
    save();
  }
  function toggleGap(id) { if (state.gaps[id]) delete state.gaps[id]; else state.gaps[id] = true; save(); }
  function toggleOff(day) { if (state.off[day]) delete state.off[day]; else state.off[day] = true; save(); }

  // ───────── render ─────────
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const subjTag = s => `<span class="tag tag-${s}">${s}</span>`;
  let tab = "hoy";
  try { tab = localStorage.getItem(LS_KEY + ":tab") || "hoy"; } catch (e) { /* nada */ }
  if (/^#(hoy|agenda|asignaturas|examenes|material|apuntes|ajustes)$/.test(location.hash)) tab = location.hash.slice(1);
  let openTask = null;

  function fileLinks(t) {
    if (!t.f || !t.f.length) return `<p class="missing">Sin material en tu Drive para esta tarea: búscalo en Atenea.</p>`;
    return `<div class="files">` + t.f.map(k => {
      if (k.startsWith("a:")) {
        const a = apunteById[k.slice(2)];
        return a ? `<button class="file file-apunte" data-act="apunte" data-id="${a.id}">Apunte: ${esc(a.t)}</button>` : "";
      }
      const f = P.FILES[k];
      return f ? `<a class="file" href="${f[1]}" target="_blank" rel="noopener">${esc(f[0])}</a>` : "";
    }).join("") + `</div>`;
  }

  const apunteById = Object.fromEntries((P.APUNTES || []).map(a => [a.id, a]));
  let openApunte = null;
  const mdCache = {};

  // Carga perezosa: primero el Markdown (ligero) y después MathJax para las fórmulas
  let markedPromise = null, mathPromise = null;
  function loadScript(src) {
    return new Promise((res, rej) => { const el = document.createElement("script"); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
  }
  function loadMarked() {
    if (!markedPromise) markedPromise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js").catch(() => null);
    return markedPromise;
  }
  function loadMath() {
    if (!mathPromise) {
      window.MathJax = { tex: { inlineMath: [["$", "$"]], displayMath: [["$$", "$$"]] }, svg: { fontCache: "global" }, startup: { typeset: false } };
      mathPromise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.min.js")
        .then(() => window.MathJax.startup && window.MathJax.startup.promise).catch(() => null);
    }
    return mathPromise;
  }
  function mdToHtml(src) {
    const math = [];
    const protectedSrc = src.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, m => { math.push(m); return "@@MATH" + (math.length - 1) + "@@"; });
    const html = window.marked ? window.marked.parse(protectedSrc) : "<pre>" + esc(protectedSrc) + "</pre>";
    return html.replace(/@@MATH(\d+)@@/g, (m, i) => esc(math[Number(i)]));
  }
  async function showApunte(id) {
    loadMath();
    try {
      const [md] = await Promise.all([
        mdCache[id] ? Promise.resolve(mdCache[id]) : fetch("apuntes/" + id + ".md").then(r => { if (!r.ok) throw new Error("http " + r.status); return r.text(); }),
        loadMarked()
      ]);
      mdCache[id] = md;
      const box = $("#apunte-body");
      if (openApunte !== id || !box) return;
      box.innerHTML = mdToHtml(md);
      box.querySelectorAll("a[href^='http']").forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
      box.querySelectorAll("table").forEach(t => { const w = document.createElement("div"); w.className = "table-wrap"; t.parentNode.insertBefore(w, t); w.appendChild(t); });
      await loadMath();
      if (openApunte === id && $("#apunte-body") === box && window.MathJax && window.MathJax.typesetPromise) await window.MathJax.typesetPromise([box]);
    } catch (e) {
      const box = $("#apunte-body");
      if (box) box.innerHTML = `<p class="missing">No se pudo cargar el apunte. Comprueba la conexión y vuelve a abrirlo. También está en el repositorio, en apuntes/${esc(id)}.md.</p>`;
    }
  }

  function taskCard(t, opts) {
    const done = !!state.done[t.id];
    const open = opts && opts.open;
    const late = opts && opts.late;
    return `<article class="task ${done ? "is-done" : ""} ${late ? "is-late" : ""}" data-id="${t.id}">
      <div class="task-head">
        <button class="check" data-act="done" data-id="${t.id}" aria-pressed="${done}" aria-label="${done ? "Marcar como pendiente" : "Marcar como hecha"}"><span></span></button>
        <button class="task-title" data-act="open" data-id="${t.id}" aria-expanded="${open}">
          <span class="task-meta">${subjTag(t.s)}<span class="ph">${t.ph === "P" ? "parcial" : "final"}</span><span class="mins">${t.m} min</span>${late ? `<span class="late-chip">atrasada</span>` : ""}</span>
          <span class="task-name">${esc(t.t)}</span>
        </button>
      </div>
      ${open ? `<div class="task-body">
        <ol class="steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        ${fileLinks(t)}
        ${t.due ? `<p class="due">Fecha límite: ${dayLabel(t.due)}</p>` : ""}
      </div>` : ""}
    </article>`;
  }

  function renderHeader(today) {
    const pace = computePace(today);
    let cls = "ok", text, sub;
    const behind = pace.expectedBefore - pace.done;
    const ahead = pace.done - pace.expectedThrough;
    if (today < P.START) { text = "Empiezas el " + dayLabel(P.START); sub = "El plan arranca mañana."; cls = "ok"; }
    else if (behind > 20) { cls = behind > 240 ? "bad" : "warn"; text = "Vas " + hDec(behind) + " por detrás"; sub = "Lo pendiente se ha repartido en los próximos días."; }
    else if (ahead > 20) { text = "Vas " + hDec(ahead) + " por delante"; sub = "Buen margen para los imprevistos."; }
    else { text = "Vas al día"; sub = "Llevas " + hDec(pace.done) + " de estudio hecho."; }
    $("#pace").className = "pace pace-" + cls;
    $("#pace-text").textContent = text;
    $("#pace-sub").textContent = sub;
    $("#today-label").textContent = dayLabel(today);

    const upcoming = P.EXAMS.filter(e => e.date >= today).slice(0, 3);
    $("#countdown").innerHTML = upcoming.map(e => {
      const n = diffDays(today, e.date);
      return `<div class="cd cd-${e.subj}"><span class="cd-num"><span class="cd-n">${n === 0 ? "hoy" : n}</span><span class="cd-l">${n === 0 ? "" : n === 1 ? "día" : "días"}</span></span><span class="cd-e">${esc(e.label)}<br><small>${dayLabel(e.date)} · ${e.time}</small></span></div>`;
    }).join("") || `<p class="muted">No quedan exámenes este cuatrimestre.</p>`;
  }

  function renderHoy(today) {
    const before = doneBefore(today);
    const sch = schedule(today, before, false);
    const list = sch.byDay[today] || [];
    const listIds = new Set(list.map(t => t.id));
    const extra = TASKS.filter(t => state.done[t.id] === today && !listIds.has(t.id));
    const total = list.reduce((a, t) => a + t.m, 0);
    const doneM = list.filter(t => state.done[t.id]).reduce((a, t) => a + t.m, 0);
    const exam = P.EXAMS.find(e => e.date === today);
    let html = "";
    if (exam) html += `<div class="banner">Hoy tienes el <b>${esc(exam.label)}</b> (${exam.time}). Solo un repaso ligero; ¡suerte!</div>`;
    if (state.off[today]) {
      html += `<div class="empty"><p>Has marcado hoy como día libre. Las tareas se han movido a los próximos días.</p><button class="btn" data-act="off" data-day="${today}">Volver a estudiar hoy</button></div>`;
    } else if (!list.length) {
      html += today < P.START
        ? `<div class="empty"><p>El plan empieza el ${dayLabel(P.START)}. Échale un vistazo a la agenda y al material que falta.</p></div>`
        : `<div class="empty"><p>Hoy no tienes nada programado: es un día de colchón. Repasa tus fichas o adelanta una tarea de abajo.</p></div>`;
    } else {
      const pct = total ? Math.round((doneM / total) * 100) : 0;
      html += `<div class="day-summary"><div><b>${hm(total)}</b> previstas · ${hm(doneM)} hechas</div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div></div>`;
      html += `<p class="how">Para cada tarea: abre el material, estudia y haz tu resumen <b>en papel</b>. Márcala al terminar.</p>`;
      html += list.map(t => taskCard(t, { open: openTask === t.id || (openTask === null && t === list.find(x => !state.done[x.id])), late: t.target < today && !state.done[t.id] && diffDays(t.target, today) > 2 })).join("");
      const allDone = list.every(t => state.done[t.id]);
      if (allDone) html += `<div class="banner ok">Has terminado lo de hoy. Si te queda energía, adelanta la siguiente tarea.</div>`;
      html += `<div class="row-actions"><button class="btn ghost" data-act="off" data-day="${today}">Hoy no puedo estudiar</button></div>`;
    }
    if (extra.length) html += `<h3 class="sub">Adelantado hoy</h3>` + extra.map(t => taskCard(t, { open: openTask === t.id })).join("");

    const next = schedule(today, new Set(Object.keys(state.done)), false);
    const nextList = [];
    Object.keys(next.byDay).sort().forEach(d => { if (d > today) next.byDay[d].forEach(t => nextList.push([d, t])); });
    if (nextList.length) {
      html += `<h3 class="sub">Para adelantar</h3><p class="muted small">Las siguientes tareas de tu agenda. Si haces una hoy, el plan se recoloca solo.</p>`;
      html += nextList.slice(0, 3).map(([d, t]) => `<div class="next-wrap"><span class="next-day">${dayLabel(d)}</span>${taskCard(t, { open: openTask === t.id })}</div>`).join("");
    }
    $("#view").innerHTML = html;
  }

  function renderAgenda(today) {
    const sch = schedule(today, doneBefore(today), false);
    let html = `<p class="muted small">Próximas tres semanas. Pulsa una tarea para ver qué hacer. Puedes marcar un día como libre y el resto se reparte.</p>`;
    for (let i = 0; i < 21; i++) {
      const d = addDays(today, i);
      const list = sch.byDay[d] || [];
      const exams = P.EXAMS.filter(e => e.date === d);
      const ms = P.MILESTONES.filter(m => m.date === d);
      const m = list.reduce((a, t) => a + t.m, 0);
      const off = state.off[d] || P.HOLIDAYS.includes(d);
      html += `<section class="day ${i === 0 ? "is-today" : ""} ${off ? "is-off" : ""}">
        <header><h3>${i === 0 ? "Hoy · " : ""}${dayLabel(d)}</h3>
        <span class="day-m">${off ? "libre" : m ? hm(m) : "—"}</span>
        ${P.HOLIDAYS.includes(d) ? "" : `<button class="link" data-act="off" data-day="${d}">${state.off[d] ? "Estudiar" : "Día libre"}</button>`}</header>
        ${exams.map(e => `<div class="exam-line exam-${e.subj}"><b>${esc(e.label)}</b> · ${e.time}</div>`).join("")}
        ${ms.map(x => `<div class="ms-line">${esc(x.label)}</div>`).join("")}
        ${list.map(t => taskCard(t, { open: openTask === t.id })).join("")}
      </section>`;
    }
    $("#view").innerHTML = html;
  }

  function renderAsignaturas(today) {
    const proj = projections(today);
    const sch = schedule(today, doneBefore(today), false);
    $("#view").innerHTML = SUBJ_ORDER.map(s => {
      const S = P.SUBJECTS[s];
      const phases = ["P", "F"].map(ph => {
        const o = proj[s + ph]; const ex = examOf(s, ph);
        const pct = Math.round((o.done / o.total) * 100);
        let status;
        if (o.done >= o.total) status = `<span class="ok-t">Temario completado</span>`;
        else if (o.late > 0) status = `<span class="bad-t">A este ritmo no llegas: ${hDec(o.late)} quedarían después del límite</span>`;
        else status = `Terminas el ${dayLabel(o.last)} · ${diffDays(o.last, ex.date)} días de margen`;
        return `<div class="phase"><div class="phase-h"><b>${ph === "P" ? "Hasta el parcial" : "Hasta el final"}</b> <span>${dayLabel(ex.date)}</span></div>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <div class="phase-s">${hDec(o.done)} de ${hDec(o.total)} · ${status}</div></div>`;
      }).join("");
      const tasks = TASKS.filter(t => t.s === s);
      return `<section class="subject subject-${s}">
        <header><div>${subjTag(s)} <span class="course">${S.course} · ${S.code}</span></div><h2>${esc(S.name)}</h2><p class="muted small">${esc(S.profs)}</p></header>
        <div class="phases">${phases}</div>
        <details><summary>Cómo se evalúa</summary><table class="eval">${S.evaluation.map(r => `<tr><td>${esc(r[0])}</td><td class="num">${r[1]}</td><td>${esc(r[2])}</td></tr>`).join("")}</table></details>
        <details><summary>Temario de la guía docente</summary><ul class="syl">${S.syllabus.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
        <details><summary>Todas las tareas (${tasks.filter(t => state.done[t.id]).length}/${tasks.length})</summary>
          <ul class="tlist">${tasks.map(t => {
            const d = state.done[t.id];
            const when = d ? "hecha el " + dayLabel(d) : sch.dayOf[t.id] ? dayLabel(sch.dayOf[t.id]) : "";
            return `<li class="${d ? "is-done" : ""}"><button class="check sm" data-act="done" data-id="${t.id}" aria-pressed="${!!d}" aria-label="${d ? "Marcar como pendiente" : "Marcar como hecha"}"><span></span></button><span class="tl-name">${esc(t.t)}</span><span class="tl-when">${t.ph} · ${when}</span></li>`;
          }).join("")}</ul></details>
        <div class="links"><a href="${S.folder}" target="_blank" rel="noopener">Carpeta de Drive</a>${(S.extraFolders || []).map(x => `<a href="${x[1]}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join("")}<a href="${S.guide}" target="_blank" rel="noopener">Guía docente</a><a href="https://atenea.upc.edu/" target="_blank" rel="noopener">Atenea</a></div>
      </section>`;
    }).join("");
  }

  function renderExamenes(today) {
    const items = P.EXAMS.map(e => ({ date: e.date, html: `<b>${esc(e.label)}</b> · ${e.time}<br><small>${esc(e.weight)}</small>`, cls: "exam-" + e.subj, n: diffDays(today, e.date) }))
      .concat(P.MILESTONES.map(m => ({ date: m.date, html: esc(m.label), cls: "ms", n: diffDays(today, m.date) })))
      .concat(TASKS.filter(t => t.due).map(t => ({ date: t.due, html: `${esc(t.t)}<br><small>Confirma la fecha según tu grupo de lab</small>`, cls: "exam-" + t.s + " soft", n: diffDays(today, t.due) })))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    $("#view").innerHTML = `<p class="muted small">Exámenes oficiales de la ETSETB (GREELEC, Tardor 26-27) y fechas de cada asignatura.</p>
      <ol class="timeline">${items.map(i => `<li class="${i.cls} ${i.n < 0 ? "past" : ""}"><span class="tl-date">${dayLabel(i.date)}</span><span class="tl-body">${i.html}</span><span class="tl-n">${i.n < 0 ? "pasado" : i.n === 0 ? "hoy" : "en " + i.n + " d"}</span></li>`).join("")}</ol>
      <p class="muted small">Fuente: <a href="https://telecos.upc.edu/ca/curs-actual/calendaris/calendaris-dexamens/calendari-dexamens" target="_blank" rel="noopener">calendario de exámenes de la ETSETB</a>. Comprueba cambios de última hora en Atenea.</p>`;
  }

  function renderMaterial() {
    $("#view").innerHTML = `<p class="muted small">Comparé la guía docente de cada asignatura con tu Drive. Lo que faltaba lo he cubierto con apuntes propios (pestaña Apuntes); aquí queda anotado qué cubre cada uno y qué solo se puede sacar de Atenea. Marca la casilla cuando tengas también el material oficial.</p>` +
      SUBJ_ORDER.map(s => {
        const gaps = P.GAPS.filter(g => g.s === s);
        const covered = gaps.filter(g => (g.fill && g.fill.length) || state.gaps[g.id]).length;
        return `<section class="gapbox"><header>${subjTag(s)} <span class="muted small">${covered}/${gaps.length} cubierto</span> <a class="link" href="${P.SUBJECTS[s].folder}" target="_blank" rel="noopener">Abrir carpeta</a></header>
          <ul class="gaps">${gaps.map(g => `<li><button class="check sm" data-act="gap" data-id="${g.id}" aria-pressed="${!!state.gaps[g.id]}" aria-label="Tengo el material oficial"><span></span></button>
            <div class="gap-txt"><span>${esc(g.t)}</span>
            ${g.fill ? `<span class="gap-fill">Cubierto por Claude: ${g.fill.map(id => `<button class="link" data-act="apunte" data-id="${id}">${esc(apunteById[id].t)}</button>`).join(" · ")}</span>` : ""}
            ${g.atenea ? `<span class="gap-atenea">${esc(g.atenea)}</span>` : ""}
            </div></li>`).join("")}</ul></section>`;
      }).join("");
  }

  function renderApuntes() {
    if (openApunte && apunteById[openApunte]) {
      const a = apunteById[openApunte];
      const tasks = TASKS.filter(t => (t.f || []).includes("a:" + a.id));
      $("#view").innerHTML = `<div class="row-actions"><button class="btn ghost" data-act="apunte-close">← Todos los apuntes</button></div>
        <article class="apunte subject-${a.s}"><header>${subjTag(a.s)}</header><div id="apunte-body" class="md"><p class="muted">Cargando el apunte…</p></div>
        ${tasks.length ? `<footer class="apunte-foot"><b>Se usa en:</b> ${tasks.map(t => esc(t.t)).join(" · ")}</footer>` : ""}</article>`;
      showApunte(a.id);
      return;
    }
    $("#view").innerHTML = `<p class="muted small">Apuntes que he redactado para cubrir lo que faltaba en tu Drive según las guías docentes. Están pensados para estudiar y hacer tus resúmenes en papel: teoría, fórmulas, ejemplos y ejercicios resueltos. Si consigues las transparencias oficiales, mandan ellas en la notación.</p>` +
      SUBJ_ORDER.map(s => `<section class="gapbox"><header>${subjTag(s)} <span class="muted small">${P.SUBJECTS[s].name}</span></header>
        <ul class="apl">${P.APUNTES.filter(a => a.s === s).map(a => {
          const gaps = P.GAPS.filter(g => (g.fill || []).includes(a.id));
          return `<li><button class="apl-btn" data-act="apunte" data-id="${a.id}"><span class="apl-t">${esc(a.t)}</span>${gaps.length ? `<span class="apl-c">Cubre: ${gaps.map(g => esc(g.t)).join("; ")}</span>` : ""}</button></li>`;
        }).join("")}</ul></section>`).join("");
  }

  function renderAjustes() {
    const c = cap();
    const order = [1, 2, 3, 4, 5, 6, 0];
    const names = { 0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado" };
    const offs = Object.keys(state.off).sort();
    $("#view").innerHTML = `<section class="settings">
      <h3>Tiempo de estudio por día</h3>
      <p class="muted small">Minutos que quieres dedicar cada día. El plan se recalcula al momento. Los días de examen se limitan a 60 min.</p>
      <div class="capgrid">${order.map(d => `<label for="cap-${d}">${names[d]}<input id="cap-${d}" type="number" min="0" max="600" step="15" value="${c[d]}" data-cap="${d}"></label>`).join("")}</div>
      <h3>Días libres</h3>
      <p class="muted small">${offs.length ? offs.map(dayLabel).join(", ") : "Ninguno marcado."} Los marcas desde Hoy o desde la Agenda. Además, el 24, 25 y 31 de diciembre y el 1 de enero no hay plan.</p>
      <h3>Copia de seguridad</h3>
      <p class="muted small">Copia este texto para guardar tu progreso, o pega uno anterior y pulsa Restaurar.</p>
      <textarea id="backup" rows="4" spellcheck="false">${esc(JSON.stringify(state))}</textarea>
      <div class="row-actions"><button class="btn ghost" data-act="copy">Copiar</button><button class="btn ghost" data-act="restore">Restaurar</button></div>
      <p id="backup-msg" class="muted small" role="status"></p>
      <h3>Empezar de cero</h3>
      <div class="row-actions"><button class="btn danger" data-act="reset">Borrar progreso</button></div>
      <p id="reset-msg" class="muted small" role="status"></p>
    </section>`;
  }

  function renderSync() {
    const el = $("#sync");
    if (!el) return;
    el.textContent = store.error || (store.mode === "sync" ? "Progreso sincronizado con tu cuenta de Claude." : "Progreso guardado en este navegador.");
  }

  function render() {
    const today = todayStr();
    renderHeader(today);
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
    ({ hoy: renderHoy, agenda: renderAgenda, asignaturas: renderAsignaturas, examenes: renderExamenes, material: renderMaterial, apuntes: renderApuntes, ajustes: renderAjustes }[tab] || renderHoy)(today);
    renderSync();
  }

  // ───────── eventos ─────────
  let resetArmed = false;
  document.addEventListener("click", e => {
    const tb = e.target.closest(".tabs button");
    if (tb) { tab = tb.dataset.tab; openTask = null; openApunte = null; try { localStorage.setItem(LS_KEY + ":tab", tab); } catch (x) { /* nada */ } render(); window.scrollTo(0, 0); return; }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "done") toggleDone(b.dataset.id);
    else if (act === "open") { openTask = openTask === b.dataset.id ? "" : b.dataset.id; render(); }
    else if (act === "gap") toggleGap(b.dataset.id);
    else if (act === "apunte") { openApunte = b.dataset.id; tab = "apuntes"; render(); window.scrollTo(0, 0); }
    else if (act === "apunte-close") { openApunte = null; render(); }
    else if (act === "off") toggleOff(b.dataset.day);
    else if (act === "copy") {
      const ta = $("#backup");
      navigator.clipboard.writeText(ta.value).then(() => ($("#backup-msg").textContent = "Copiado."), () => { ta.select(); $("#backup-msg").textContent = "Selecciona el texto y cópialo a mano."; });
    } else if (act === "restore") {
      try { const s = JSON.parse($("#backup").value); applyState(s); save(); $("#backup-msg").textContent = "Progreso restaurado."; }
      catch (x) { $("#backup-msg").textContent = "Ese texto no es una copia válida. Pega el texto completo que copiaste."; }
    } else if (act === "reset") {
      if (!resetArmed) { resetArmed = true; b.textContent = "Pulsa otra vez para confirmar"; $("#reset-msg").textContent = "Se borrarán las tareas hechas, los días libres y el material marcado."; return; }
      resetArmed = false;
      state = { done: {}, gaps: {}, off: {}, cap: state.cap, updatedAt: 0 };
      save();
    }
  });
  document.addEventListener("change", e => {
    const inp = e.target.closest("[data-cap]");
    if (!inp) return;
    const v = Math.max(0, Math.min(600, Math.round(Number(inp.value) || 0)));
    state.cap = Object.assign({}, cap(), { [inp.dataset.cap]: v });
    save();
  });

  // Recalcula al pasar la medianoche si la página sigue abierta
  let lastDay = todayStr();
  setInterval(() => { const d = todayStr(); if (d !== lastDay) { lastDay = d; render(); } }, 60000);

  loadLocal();
  render();
  connectDb();

  // Para pruebas desde consola
  window.__plan = { schedule, baseline, TASKS, computePace, projections, addDays };
})();
