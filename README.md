# WCAG Checklist

A desktop application to audit accessibility compliance according to WCAG 2.1/2.2 and export a report about the current state of accessibility.

## Features
- Load a WCAG template (JSON) and check pass/fail criteria
- Save audit results locally
- Export results to PDF (for clients) or Markdown (for internal documentation)
- Include organization header in the report
- Export and import JSON audits
- Automatic updates on Windows (macOS manual updates, auto-update planned)

## How to run
Download the latest release from the [Releases page](https://github.com/DieUlrike/wcag-checklist/releases).  
The application is available for Windows and macOS.

## Folder structure
- `index.html` – Main application page
- `style.css` – Styling
- `app.js` – Application logic
- `main.js` – Electron main process
- `wcag-template.json` – WCAG criteria template
- `/images` – Logo and other images

## Project status
Current version: **1.1.0**  
Windows auto-update is enabled.  
macOS updates are currently manual (Apple Developer certificate required for auto-update).  

## Student project
This is a student project – use at your own risk.