// Kriterien-Daten
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

function exportMarkdown() {
  const now = new Date().toISOString().slice(0,19).replace('T',' ');
  const md = [
    '# WCAG Checkliste – Bericht',
    `Erstellt: ${now}`,
    '',
    '## Zusammenfassung',
    '- Gesamt: 0',
    '- Bestanden: 0',
    '- Offen: 0',
    '',
    '## Details',
    '_Platzhalter. Später füllen wir echte Daten ein._'
  ].join('\n');

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

document.getElementById('export-md')?.addEventListener('click', exportMarkdown);
