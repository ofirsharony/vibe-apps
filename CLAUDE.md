# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of small, standalone "vibe-coded" web apps. There is no build system, package manager, linter, or test suite — every app is a single self-contained `index.html` (inline `<style>` and `<script>`, no external dependencies except Google Fonts). To run any app, just open its `index.html` in a browser (e.g., `open focus-timer/index.html`).

## Structure

- Root `index.html` is a dark-themed landing page that links to every app via cards inside `<section class="grid">`.
- Each app lives in its own lowercase-hyphenated folder (e.g., `focus-timer/`, `clock-reader/`, `dino-hunter/`) containing its `index.html`.

## Adding a new app

1. Create `<folder-name>/index.html` as a single self-contained file.
2. Register it on the landing page by adding a card to the root `index.html` grid, following the existing pattern:

```html
<a href="<folder-name>/index.html" class="card card--<color>">
  <span class="card-arrow">↗</span>
  <div class="card-icon">[emoji]</div>
  <span class="card-tag">[Category]</span>
  <h2>[Title]</h2>
  <p>[One-line description]</p>
</a>
```

Card color variants: `purple`, `blue`, `pink`, `green`, `orange`, `cyan`.

## Kids educational apps

For Hebrew educational apps for children aged 7–9, follow the detailed spec in `.cursor/skills/kids-app/SKILL.md`. Key points:

- `<html lang="he" dir="rtl">`, all UI text in Hebrew, `Rubik` Google Font.
- Levels progressing from easy to hard, progress display, reward system, "שחק שוב" replay button, positive-reinforcement-only feedback.
- Emoji/inline SVG only (no image URLs), Web Audio API beeps (no audio files), large fonts (≥18px) and touch targets (≥48px).
- RTL punctuation: write punctuation at the end of the Hebrew string (`"כל הכבוד!"`), before any trailing emoji.
