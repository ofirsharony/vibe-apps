# Vibe Apps

A collection of small, standalone "vibe-coded" web apps. Each app is a single self-contained
`index.html` (inline styles and scripts, no build step or dependencies besides Google Fonts).

Live landing page: https://ofirsharony.github.io/vibe-apps/ (GitHub Pages)

## Apps

Several of these are Hebrew-language educational games for kids.

| App | Description |
| --- | --- |
| [focus-timer](focus-timer/index.html) | A minimal pomodoro timer with ambient sounds and session tracking. |
| [dino-hunter](dino-hunter/index.html) | Help T-Rex find herbivore dinosaurs to eat in this Hebrew learning game (kids). |
| [clock-reader](clock-reader/index.html) | A Hebrew educational game teaching kids to read analog and digital clocks (kids). |
| [ramzor](ramzor/index.html) | A family rules traffic-light board — drag rules between red, yellow, and green, then print. |
| [dino-3d](dino-3d/index.html) | Hatch, feed, parade and time-travel with 19 dinosaurs in an interactive 3D Hebrew explorer (kids). |
| [car-race](car-race/index.html) | Pick a car in any color, choose one of six themed circuits and race five rivals with nitro and confetti. |
| [lego-studio](lego-studio/index.html) | Design, build and showcase LEGO-style models in 3D, with presets and step-by-step instructions (Hebrew). |

## Run locally

There's no build system or package manager. Either:

- Open any app's `index.html` directly in a browser, or
- Serve the whole repo so relative links work: `python3 -m http.server` from the repo root, then
  visit `http://localhost:8000`.

## Adding an app

See [CLAUDE.md](CLAUDE.md) for the folder layout and steps to register a new app card on the
landing page.

## License

MIT — see [LICENSE](LICENSE).
