---
name: kids-app
description: Generate a single-page educational app for children aged 7-9 with Hebrew text. Use when the user wants to create a kids learning app, educational game, Hebrew children's app, or asks to build a new edu app on a specific topic.
---

# Kids Educational App Generator

Generate a self-contained, single-page HTML educational app for children aged 7–9. All visible text must be in **Hebrew** (RTL). Each app lives in its own folder and is linked from the project's root `index.html`.

## Workflow

### Step 1 — Gather the Topic

If the user hasn't specified a topic, ask:

> What topic should the app teach? (e.g., multiplication tables, the solar system, reading clocks, animals of Israel)

### Step 2 — Design the App

Before writing code, decide on:

1. **App concept** — pick an interactive format that fits the topic. Prefer one of:
   - Quiz / trivia with illustrated feedback
   - Drag-and-drop matching
   - Flashcard explorer with animations
   - Interactive story / adventure with choices
   - Sorting / categorization game
2. **Folder name** — lowercase, hyphens, English (e.g., `solar-system-explorer`)
3. **Reward system** — stars, points, or progress bar to keep kids engaged
4. **Visual theme** — bright, playful colors with rounded shapes and large touch targets

Present a short summary to the user and get approval before generating code.

### Step 3 — Generate the App

Create `<folder-name>/index.html` as a **single self-contained HTML file** (no external JS/CSS dependencies except Google Fonts).

#### Mandatory requirements

| Requirement | Details |
|---|---|
| **Language** | All UI text in Hebrew. `<html lang="he" dir="rtl">` |
| **Single file** | Everything in one `index.html` — inline `<style>` and `<script>` |
| **Responsive** | Works on desktop and tablets (min-width 768px primary target) |
| **Accessible** | Sufficient color contrast, focusable elements, `aria-label` on icon-only buttons |
| **Engaging** | Animations (CSS transitions/keyframes), sound effects (Web Audio API short beeps — no external files), celebratory feedback on correct answers |
| **Age-appropriate** | Large fonts (≥18px body), big click/tap targets (≥48px), simple language, positive reinforcement only — no negative or punishing feedback |
| **Progress tracking** | Show progress (e.g., "שאלה 3 מתוך 10") and a final score/summary screen |
| **Replayable** | A "שחק שוב" (play again) button on the summary screen |
| **No external assets** | Use emoji or inline SVG for illustrations — no image URLs |
| **Educational content** | Include at least 10-15 questions/items with accurate, age-appropriate content for the topic |
| **Difficulty progression** | Structure the app in levels that progress from simple to hard. Start with the easiest concepts and gradually increase difficulty. Show a level badge/label so the child knows which level they're on. |

#### Visual style guide

- Background: soft gradient (e.g., light blue → light purple, or warm pastels)
- Cards/containers: white or near-white with `border-radius: 16px–24px` and subtle `box-shadow`
- Primary font: `Rubik` from Google Fonts (supports Hebrew well)
- Accent colors: vibrant but not harsh — think candy palette
- Emoji used generously as visual anchors (🌟⭐🎉✨🏆)
- Smooth transitions on interactions (0.2–0.4s ease)
- Celebrate correct answers with a short animation (confetti, bounce, glow)

#### Code structure

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Hebrew App Title] — Vibe Apps</title>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    /* All styles here */
  </style>
</head>
<body>
  <!-- App markup here -->
  <script>
    /* All logic here */
  </script>
</body>
</html>
```

### Step 4 — Register in the Index

Add a card to the root `index.html` inside the `<section class="grid">` block. Follow the existing card pattern:

```html
<a href="<folder-name>/index.html" class="card card--<color>">
  <span class="card-arrow">↗</span>
  <div class="card-icon">[emoji]</div>
  <span class="card-tag">Education</span>
  <h2>[English title]</h2>
  <p>[One-line English description]</p>
</a>
```

Available color variants: `purple`, `blue`, `pink`, `green`, `orange`, `cyan`. Pick one that hasn't been used recently.

### Step 5 — Verify

1. Confirm the file was created at `<folder-name>/index.html`
2. Confirm the card was added to root `index.html`
3. Check for linter errors in the generated file
4. Summarize what was built and tell the user they can open it

## Content Guidelines

- All Hebrew text must be grammatically correct and use vocabulary appropriate for 7–9 year olds
- Use ניקוד (vowel marks) sparingly — only where it genuinely helps readability for this age group
- **RTL punctuation** — Place punctuation (`!`, `?`, `.`) at the **end** of the Hebrew string, not the beginning. In RTL, the visual "end" is the left side, so writing `"כל הכבוד!"` renders correctly, while `"!כל הכבוד"` causes the `!` to appear on the wrong side. Same applies to `?` in questions. When emoji follow the text, put punctuation before the emoji: `"מצוין! ✨"`.
- Positive reinforcement: "כל הכבוד!", "מצוין!", "נכון מאוד!" for correct answers
- Gentle encouragement on wrong answers: "קרוב! נסה שוב" or "לא נורא, נסה פעם נוספת!"
- Final screen should celebrate the child's effort regardless of score
