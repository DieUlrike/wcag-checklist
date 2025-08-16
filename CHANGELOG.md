# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] – 2025-08-16
### Added
- Electron desktop app (Windows & macOS)
- PDF export (client-friendly report)
- Markdown export (internal full report)
- JSON import/export (audit data round-trip)
- Local autosave (restores current audit)
- App icons (`.icns` for macOS, `.ico` for Windows)
- GitHub Actions CI for building and publishing releases
- Windows auto-update via `electron-updater`

### Changed
- README updated to reflect Electron app and current status

### Known limitations
- macOS auto-update requires a paid Apple Developer certificate; for now updates are manual (download new DMG/ZIP from Releases).

[1.0.0]: https://github.com/DieUlrike/wcag-checklist/releases/tag/v1.0.0