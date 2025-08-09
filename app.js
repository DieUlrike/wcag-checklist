// Feste WCAG-Startvorlage (klein; später durch komplette 2.2 AA ersetzt)
const CHECKLIST_TEMPLATE = [
  { id: "1.1.1", titel: "Nicht-Text-Inhalte", level: "A",  tool: "", ergebnis: "", status: "na" },
  { id: "1.3.1", titel: "Info und Beziehungen", level: "A", tool: "", ergebnis: "", status: "na" },
  { id: "1.4.3", titel: "Kontrast Minimum", level: "AA", tool: "", ergebnis: "", status: "na" },
  { id: "2.1.1", titel: "Tastatur", level: "A", tool: "", ergebnis: "", status: "na" },
  { id: "2.4.3", titel: "Fokus-Reihenfolge", level: "A", tool: "", ergebnis: "", status: "na" }
];

// frische Arbeitskopie aus der Vorlage erzeugen
function freshChecklistFromTemplate() {
  return CHECKLIST_TEMPLATE.map(i => ({ ...i }));
}


// =========================
// Kriterien-Daten (Beispiel)
// =========================
const criteria = [
  {
    id: "1.1.1",
    titel: "Nicht-Text-Inhalte",
    tool: "Manuelle Prüfung + Screenreader NVDA",
    ergebnis: "Logo ohne Alternativtext gefunden.",
    status: "fail"
  },
  {
    id: "1.3.1",
    titel: "Info und Beziehungen",
    tool: "HTML-Inspektion",
    ergebnis: "Struktur korrekt mit Überschriften ausgezeichnet.",
    status: "pass"
  },
  {
    id: "1.4.3",
    titel: "Kontrast Minimum",
    tool: "WAVE + manuelle Messung",
    ergebnis: "Grauer Text auf hellgrauem Hintergrund, Kontrast 3.2:1.",
    status: "fail"
  }
];

console.log("WCAG Checkliste – Prototyp geladen");

// =====================================
// Markdown-Export aus den echten Daten
// =====================================
function exportMarkdown() {
  const now = new Date().toISOString().slice(0,19).replace('T',' ');

  // Totals berechnen
  const totals = {
    pass: criteria.filter(c => c.status === "pass").length,
    fail: criteria.filter(c => c.status === "fail").length,
    na:   criteria.filter(c => c.status === "na").length,
    all:  criteria.length
  };

  // Bericht zusammenbauen
  const parts = [];
  parts.push('# WCAG Checkliste – Bericht');
  parts.push(`Erstellt: ${now}`);
  parts.push('');
  parts.push('## Zusammenfassung');
  parts.push(`- Gesamt: ${totals.all}`);
  parts.push(`- Bestanden: ${totals.pass}`);
  parts.push(`- Offen/Handlungsbedarf: ${totals.fail}`);
  parts.push(`- Nicht anwendbar: ${totals.na}`);
  parts.push('');

  parts.push('## Details');
  for (const c of criteria) {
    const statusLabel = c.status === 'pass' ? 'Bestanden'
                      : c.status === 'fail' ? 'Handlungsbedarf'
                      : 'Nicht anwendbar';
    parts.push(`### ${c.id} – ${c.titel}`);
    parts.push(`**Status:** ${statusLabel}`);
    if (c.tool) parts.push(`**Geprüft mit:** ${c.tool}`);
    if (c.ergebnis) parts.push(`**Ergebnis:** ${c.ergebnis}`);
    parts.push('');
  }

  const md = parts.join('\n');

  // Download auslösen
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wcag-bericht-${now.replace(/[: ]/g,'-')}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Button verdrahten
document.getElementById('export-md')?.addEventListener('click', exportMarkdown);

// =====================================
// JSON-Export: aktuellen Stand speichern
// =====================================
function exportJSON() {
  const payload = {
    erstellt: new Date().toISOString(),
    version: "0.1",
    criteria // exportiert dein aktuelles Array mit
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:]/g, "-");
  a.href = url;
  a.download = `wcag-checkliste-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('export-json')?.addEventListener('click', exportJSON);

// =====================================
// JSON-Import (Datei wählen und laden)
// =====================================

// Button öffnet den versteckten <input type="file">
document.getElementById('import-json-btn')?.addEventListener('click', () => {
  document.getElementById('import-json')?.click();
});

// Datei einlesen, validieren, übernehmen
document.getElementById('import-json')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Erwartetes Format: { erstellt, version, criteria: [...] }
    if (!data || !Array.isArray(data.criteria)) {
      alert("Ungültiges Format. Erwartet wird ein Objekt mit Feld 'criteria' (Array).");
      return;
    }

    // Bestehendes Array ersetzen
    criteria.length = 0;
    for (const item of data.criteria) criteria.push(item);

    // Optional: lokale Speicherung/UI neu aufbauen (nur wenn vorhanden)
    if (typeof saveToLocal === 'function') saveToLocal();
    if (typeof renderForm === 'function') renderForm();

    alert(`Import erfolgreich: ${criteria.length} Kriterien geladen.`);
  } catch (err) {
    console.warn("Import fehlgeschlagen:", err);
    alert("Konnte die Datei nicht lesen. Ist es gültiges JSON?");
  } finally {
    // Zurücksetzen, damit dieselbe Datei erneut importiert werden kann
    e.target.value = "";
  }
});

// Neues Audit aus der festen Vorlage erstellen
document.getElementById('new-audit')?.addEventListener('click', () => {
  if (!confirm("Neues Audit starten? Ungespeicherte Änderungen gehen verloren.")) return;

  // Arbeitsdaten durch frische Kopie aus der Vorlage ersetzen
  const fresh = freshChecklistFromTemplate();
  criteria.length = 0;
  for (const item of fresh) criteria.push(item);

  // Optional vorhandene Hooks aufrufen (falls du sie später einbaust)
  if (typeof saveToLocal === 'function') saveToLocal();
  if (typeof renderForm === 'function') renderForm();
  if (typeof renderView === 'function') renderView();

  alert("Neue, leere Checkliste aus der Vorlage erstellt.");
});

