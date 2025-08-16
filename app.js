// ---- Meta (Projektinfos) ----
let meta = { company: "", url: "", contact: "" };

// ---- Persistenz (Autosave) ----
const STORAGE_KEY = "wcag-checklist-current";

function saveToLocal() {
  try {
    const payload = { meta, criteria };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Konnte nicht speichern:", e);
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);

    // Rückwärtskompatibel: ganz alte Versionen speicherten nur das Array
    if (Array.isArray(saved)) {
      criteria.length = 0;
      for (const item of saved) criteria.push(item);
      return;
    }

    // Neues Format: { meta, criteria }
    if (saved && Array.isArray(saved.criteria)) {
      meta = { company: "", url: "", contact: "", ...(saved.meta || {}) };
      criteria.length = 0;
      for (const item of saved.criteria) criteria.push(item);
    }
  } catch (e) {
    console.warn("Konnte nicht laden:", e);
  }
}

// Arbeitskopie (wird via New Audit/Import gefüllt oder aus LocalStorage)
let criteria = [];

console.log("WCAG Checkliste – Prototyp geladen");

// ---- Helpers für Meta-Form ----
function isValidUrl(u) {
  try {
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    const { protocol, hostname } = new URL(u);
    return (protocol === "http:" || protocol === "https:") && !!hostname;
  } catch { return false; }
}
function normalizeUrl(u) {
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { return new URL(u).toString(); } catch { return u; }
}

// Inline-Formular für Unternehmensname/URL anzeigen und dann onConfirm() ausführen
function showNewAuditForm(onConfirm) {
  const content = document.getElementById('content');
  if (!content) return;

    content.innerHTML = `
    <section style="border:1px solid #ddd;padding:1rem;margin:1rem 0;">
      <h2>Neues Audit starten</h2>
      <p>Bitte Projektinfos angeben. Diese erscheinen später im Bericht.</p>

      <label>
        <div>Unternehmensname <span aria-hidden="true">*</span></div>
        <input id="meta-company" type="text" placeholder="z. B. Beispiel GmbH" style="width:100%;max-width:480px;">
      </label>
      <br/><br/>

      <label>
        <div>Webseiten-URL <span aria-hidden="true">*</span></div>
        <input id="meta-url" type="text" placeholder="z. B. https://www.beispiel.de" style="width:100%;max-width:480px;">
      </label>
      <br/><br/>

      <label>
        <div>Ansprechpartner (für Anrede im Bericht) <span aria-hidden="true">*</span></div>
        <input id="meta-contact" type="text" placeholder="z. B. Max Mustermann" style="width:100%;max-width:480px;">
      </label>
      <br/><br/>

      <button id="start-audit">Audit starten</button>
    </section>
  `;


    document.getElementById('start-audit')?.addEventListener('click', () => {
    const companyEl = document.getElementById('meta-company');
    const urlEl = document.getElementById('meta-url');
    const contactEl = document.getElementById('meta-contact'); // NEU

    const company = companyEl.value.trim();
    const urlRaw  = urlEl.value.trim();
    const contact = (contactEl?.value || "").trim();          // NEU

    if (!company) { alert("Bitte Unternehmensname eingeben."); companyEl.focus(); return; }
    if (!isValidUrl(urlRaw)) { alert("Bitte eine gültige URL eingeben (z. B. https://… )."); urlEl.focus(); return; }
    if (!contact) { alert("Bitte Ansprechpartner eintragen."); contactEl.focus(); return; } // NEU

    meta.company = company;
    meta.url = normalizeUrl(urlRaw);
    meta.contact = contact; // NEU

    onConfirm?.();
  });

}

// ---- UI rendern (mit farbigen Karten je Status) ----
function renderForm() {
  const content = document.getElementById('content');
  if (!content) return;

  const totals = {
    pass: criteria.filter(c => c.status === "pass").length,
    fail: criteria.filter(c => c.status === "fail").length,
    na:   criteria.filter(c => c.status === "na").length,
    all:  criteria.length
  };

  content.innerHTML = `
  <section>
    <h2>Zusammenfassung</h2>
    <ul>
      <li><strong>Unternehmen:</strong> ${meta.company || "—"}</li>
      <li><strong>Webseite:</strong> ${meta.url || "—"}</li>
      <li><strong>Ansprechpartner:</strong> ${meta.contact || "—"}</li>
      <li><strong>WCAG Version:</strong> 2.1/2.2</li> <!-- NEU -->
    </ul>
    <ul>
      <li>Gesamt: ${totals.all}</li>
      <li>Bestanden: ${totals.pass}</li>
      <li>Handlungsbedarf: ${totals.fail}</li>
      <li>Nicht anwendbar: ${totals.na}</li>
    </ul>
  </section>
  <section>
    <h2>Kriterien ausfüllen</h2>
    <div id="crit-list"></div>
  </section>
  `;

  const list = document.getElementById('crit-list');
  list.innerHTML = criteria.map((c, i) => {
    const statusClass = c.status === "pass" ? "status-pass"
                       : c.status === "fail" ? "status-fail"
                       : "status-na";
    return `
      <article class="${statusClass}">
        <h3 style="margin:0 0 .5rem 0">${c.id} – ${c.titel}${c.level ? ` (Level ${c.level})` : ""}</h3>

        <label>
          <span>Geprüft mit</span><br/>
          <input type="text" id="tool-${i}" value="${c.tool ?? ''}" />
        </label>
        <br/><br/>

        <label>
          <span>Ergebnis / Befund</span><br/>
          <textarea id="erg-${i}" rows="2">${c.ergebnis ?? ''}</textarea>
        </label>
        <br/><br/>

        <fieldset>
          <legend>Status</legend>
          <label><input type="radio" name="status-${i}" value="pass" ${c.status==='pass'?'checked':''}/> Bestanden</label>
          <label style="margin-left:1rem;"><input type="radio" name="status-${i}" value="fail" ${c.status==='fail'?'checked':''}/> Handlungsbedarf</label>
          <label style="margin-left:1rem;"><input type="radio" name="status-${i}" value="na"   ${c.status==='na'  ?'checked':''}/> Nicht anwendbar</label>
        </fieldset>
      </article>
    `;
  }).join('');

  // Events binden + Autosave (und neu rendern, damit die Farbklasse wechselt)
  criteria.forEach((c, i) => {
    const toolEl = document.getElementById(`tool-${i}`);
    const ergEl  = document.getElementById(`erg-${i}`);
    const radios = list.querySelectorAll(`input[name="status-${i}"]`);

    toolEl.addEventListener('input', () => { c.tool = toolEl.value; saveToLocal(); /* keine Neurender nötig */ });
    ergEl.addEventListener('input',  () => { c.ergebnis = ergEl.value; saveToLocal(); });
    radios.forEach(r => r.addEventListener('change', () => { c.status = r.value; saveToLocal(); renderForm(); }));
  });
}

// =====================================
// Markdown-Export (immer interne Vollversion, ohne JSON-Dump)
// =====================================
function exportMarkdown() {
  const now = new Date().toISOString().slice(0,19).replace('T',' ');

  const totals = {
    pass: criteria.filter(c => c.status === "pass").length,
    fail: criteria.filter(c => c.status === "fail").length,
    na:   criteria.filter(c => c.status === "na").length,
    all:  criteria.length
  };

  const notapp = criteria.filter(c => c.status === "na");

  // Helper: Markdown-Escape für Tabelle
  const mdEscape = (s="") => String(s).replace(/\|/g, "\\|");

  // Komplette Tabelle
  const mdTableAll = (rows) => {
    if (rows.length === 0) return "_Keine Einträge._";
    const header = `| Status | ID | Titel | Level | Geprüft mit | Befund |\n|---|---|---|---|---|---|`;
    const body = rows.map(c =>
      `| ${c.status||""} | ${mdEscape(c.id||"")} | ${mdEscape(c.titel||"")} | ${mdEscape(c.level||"")} | ${mdEscape(c.tool||"")} | ${mdEscape((c.ergebnis||"").replace(/\n/g," "))} |`
    ).join("\n");
    return [header, body].join("\n");
  };

  const parts = [];
  parts.push('# WCAG Auditbericht (intern)');
  parts.push('');
  parts.push(`**Unternehmen:** ${meta.company || "—"}`);
  parts.push(`**Webseite:** ${meta.url || "—"}`);
  parts.push(`**Audit-Datum:** ${now}`);
  if (meta.contact) parts.push(`**Ansprechpartner:** ${meta.contact}`);
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('## Zusammenfassung');
  parts.push('');
  parts.push(`- Gesamt: ${totals.all}`);
  parts.push(`- Bestanden: ${totals.pass}`);
  parts.push(`- Handlungsbedarf: ${totals.fail}`);
  parts.push(`- Nicht anwendbar: ${totals.na}`);
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('## Alle Kriterien');
  parts.push('');
  parts.push(mdTableAll(criteria));
  parts.push('');

  if (notapp.length > 0) {
    parts.push('---');
    parts.push('');
    parts.push('## Nicht anwendbar (Liste)');
    parts.push('');
    parts.push(notapp.map(c => `- ${c.id} – ${c.titel}${c.level?` (Level ${c.level})`:""}`).join("\n"));
    parts.push('');
  }

  const md = parts.join('\n');
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = now.replace(/[: ]/g,'-');
  a.href = url;
  a.download = `wcag-bericht-internal-${stamp}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('export-md')?.addEventListener('click', exportMarkdown);

// =====================================
// JSON-Export (inkl. Meta)
// =====================================
function exportJSON() {
  const payload = {
    erstellt: new Date().toISOString(),
    version: "2.2-AA",
    meta,
    criteria
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:]/g, "-");
  a.href = url;
  a.download = `wcag-audit-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
document.getElementById('export-json')?.addEventListener('click', exportJSON);

// =====================================
// JSON-Import (inkl. Meta)
// =====================================
document.getElementById('import-json-btn')?.addEventListener('click', () => {
  document.getElementById('import-json')?.click();
});

document.getElementById('import-json')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || !Array.isArray(data.criteria)) {
      alert("Ungültiges Format. Erwartet wird ein Objekt mit Feld 'criteria' (Array).");
      return;
    }

    meta = { company: "", url: "", ...(data.meta || {}) };
    criteria.length = 0;
    for (const item of data.criteria) criteria.push(item);

    saveToLocal();
    renderForm();

    alert(`Import erfolgreich: ${criteria.length} Kriterien geladen${meta.company ? " – " + meta.company : ""}.`);
  } catch (err) {
    console.warn("Import fehlgeschlagen:", err);
    alert("Konnte die Datei nicht lesen. Ist es gültiges JSON?");
  } finally {
    e.target.value = "";
  }
});

// =====================================
// Neues Audit: Erst Meta abfragen, dann Vorlage laden
// =====================================
document.getElementById('new-audit')?.addEventListener('click', () => {
  if (!confirm("Neues Audit starten? Ungespeicherte Änderungen gehen verloren.")) return;

  showNewAuditForm(async () => {
    try {
      const res = await fetch('./wcag-template.json?v=' + Date.now()); // Cache-Busting
      if (!res.ok) throw new Error('Vorlage konnte nicht geladen werden (' + res.status + ')');
      const data = await res.json();
      if (!data || !Array.isArray(data.criteria)) throw new Error("Ungültige Vorlage: Feld 'criteria' (Array) fehlt.");

      criteria.length = 0;
      for (const item of data.criteria) criteria.push(item);

      saveToLocal();
      renderForm();

      alert(`Audit gestartet für: ${meta.company}\nURL: ${meta.url}\nKriterien: ${criteria.length}`);
    } catch (err) {
      console.warn(err);
      alert('Fehler beim Laden der Vorlage: ' + err.message);
    }
  });
});

// -------- PDF: Helpers --------
function escapeHtml(s="") {
  return String(s).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function buildPassedList() {
  const passed = criteria.filter(c => c.status === "pass");
  if (passed.length === 0) return '<p class="small">Keine bestandenen Kriterien vorhanden.</p>';
  return `<ul>${passed.map(c =>
    `<li><strong>${escapeHtml(c.id)}</strong> – ${escapeHtml(c.titel)}${c.level?` (Level ${escapeHtml(c.level)})`:""}</li>`
  ).join("")}</ul>`;
}

function buildFailedTable() {
  const failed = criteria.filter(c => c.status === "fail");
  if (failed.length === 0) return '<p class="small">Keine fehlgeschlagenen Kriterien vorhanden.</p>';
  return `
    <table class="table">
      <thead>
        <tr><th>ID</th><th>Titel</th><th>Level</th><th>Geprüft mit</th><th>Befund</th></tr>
      </thead>
      <tbody>
        ${failed.map(c => `
          <tr>
            <td>${escapeHtml(c.id)}</td>
            <td>${escapeHtml(c.titel)}</td>
            <td>${escapeHtml(c.level||"")}</td>
            <td>${escapeHtml(c.tool||"")}</td>
            <td>${escapeHtml(c.ergebnis||"").replace(/\n/g,"<br>")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `.trim();
}

// -------- PDF: Exportfunktion (lädt Template + CSS) --------
async function exportPDF() {
  try {
    const now = new Date().toISOString().slice(0,19).replace('T',' ');
    const totals = {
      pass: criteria.filter(c => c.status === "pass").length,
      fail: criteria.filter(c => c.status === "fail").length,
      na:   criteria.filter(c => c.status === "na").length,
      all:  criteria.length
    };

    // Dateien laden (Live Server benutzen, sonst blockiert fetch bei file://)
    const [template, style] = await Promise.all([
      fetch('report-template.html?v=' + Date.now()).then(r => { if(!r.ok) throw new Error('Template nicht gefunden'); return r.text(); }),
      fetch('report-style.css?v=' + Date.now()).then(r => { if(!r.ok) throw new Error('Style nicht gefunden'); return r.text(); })
    ]);

    // Platzhalter ersetzen
    const salutation = meta.contact
      ? `Guten Tag ${meta.contact},`
      : 'Sehr geehrte Damen und Herren,';

    let filled = template
      .replaceAll('{{COMPANY}}', escapeHtml(meta.company || '—'))
      .replaceAll('{{URL}}', escapeHtml(meta.url || '—'))
      .replaceAll('{{DATE}}', now)
      .replaceAll('{{TOTAL_ALL}}', String(totals.all))
      .replaceAll('{{TOTAL_PASS}}', String(totals.pass))
      .replaceAll('{{TOTAL_FAIL}}', String(totals.fail))
      .replaceAll('{{TOTAL_NA}}', String(totals.na))
      .replace('{{PASSED_LIST}}', buildPassedList())
      .replace('{{FAILED_TABLE}}', buildFailedTable())
      .replaceAll('{{CONTACT}}', escapeHtml(meta.contact || '—'))   
      .replaceAll('{{SALUTATION}}', escapeHtml(salutation));


    // finales Print-HTML bauen
    const html = `
      <!doctype html>
      <html lang="de">
      <head>
      <meta charset="utf-8">
      <title>WCAG Prüfbericht – ${escapeHtml(meta.company || '')}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${style}</style>
      </head>
      ${filled}
      </html>`.trim();

    const w = window.open("", "_blank");
    if (!w) { alert("Pop-up blockiert? Bitte Pop-ups erlauben."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();

  } catch (err) {
    console.warn(err);
    alert('PDF-Export fehlgeschlagen: ' + err.message);
  }
}

// Button verdrahten
document.getElementById('export-pdf')?.addEventListener('click', exportPDF);


// Beim Laden: vorhandene Daten anzeigen (oder leer, bis „Neues Audit“/Import)
loadFromLocal();
renderForm();
