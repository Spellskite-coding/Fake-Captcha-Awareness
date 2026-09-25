# Fake-Captcha-Awareness

**Live site:** https://spellskite-coding.github.io/Fake-Captcha-Awareness/

A static awareness website designed for people who are not comfortable with computers (parents, grandparents). It covers **ClickFix**, **FileFix** and their macOS (Terminal) variants: fake "I'm not a robot" checks that trick victims into pasting and running a malicious command themselves.

The website content is in French, as it targets a French-speaking, non-technical audience.

## Features

### Interactive demo

The visitor picks their computer (Windows or Mac, auto-detected), then tries each lure. Every scenario is modeled on real-world campaigns, and a "STOP" screen appears as soon as the visitor starts following the instructions.

| Lure | Windows | Mac |
|---|---|---|
| Fake "I'm not a robot" security check (full-page interstitial) | Run dialog (Win + R) | Terminal (Cmd + Space) |
| Fake "I'm not a robot" checkbox | PowerShell (Win + X, I) | — |
| Fake page display error ("How to fix") | PowerShell | Terminal |
| Fake browser update | Run dialog | — |
| Fake video call microphone issue | PowerShell | Terminal |
| Fake shared document (FileFix) | File Explorer address bar | — |

- Captcha pop-ups reproduce the "You will observe and agree: ✅ I am not a robot – Verification ID" social-engineering trick
- The STOP screen explains what would have happened and shows **the clue that should have raised suspicion** for that specific scenario
- A "Close" button in the fake browser bar lets visitors do the right thing: closing the page shows a green "Good reflex!" screen explaining what the page was trying to make them do
- Progress tracking, with each scenario marked as "Foiled" (page closed) or "Trapped" (instructions followed), and a "next scenario" button to go through them all
- "Reset" link to clear progress, handy when showing the demo to several people on the same computer
- The STOP screen is triggered by clicks on the fake buttons, by the trap key combinations (Windows key, Ctrl/Cmd + V, Cmd + Space…) or when the page loses focus after the visitor interacted with it. Zoom shortcuts (Ctrl/Cmd + and −) are deliberately ignored

### Learning content

- Three-step explanation of the attack, adapted to the chosen system (Run dialog for Windows, Terminal for Mac)
- One golden rule to remember, and how to tell normal behavior from a trap
- 11-question quiz: "normal or trap?", including legitimate prompts (real captchas, browser microphone permission)
- Protection tips, plus a collapsible section for the tech-savvy relative who looks after the computer
- What to do if you already fell for it
- Printable reminder card, sharing buttons (WhatsApp, email, native share)

## Safety guarantees

- **No clipboard access**: no `navigator.clipboard`, no `document.execCommand('copy')`. The "Verify" and "Copy" buttons only display the awareness message.
- **No command** anywhere in the code or on the page, not even a fake one.
- **No external resources**: no third-party fonts, scripts, images or CDN. Strict CSP (`default-src 'none'`).
- **No cookies, no trackers.** Only the text size, the chosen system and the scenarios already completed are stored in the browser's `localStorage`, on the visitor's device.
- No real brand or logo (Cloudflare, Google…): the fake check is generic, to avoid brand impersonation and anti-phishing flags.

## Deploying on GitHub Pages

1. Create a repository and push `index.html`, `style.css`, `app.js` and this README to the root.
2. *Settings › Pages › Build and deployment*: source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site is published at `https://<username>.github.io/<repository>/`.

Local testing: open `index.html` in a browser, or run `python3 -m http.server` in the folder.

## Accessibility

20 px base text size, A− / A+ buttons, high contrast, full keyboard navigation, visible focus, `prefers-reduced-motion` support, modal dialog with focus trap and Escape to close.

## License

To be defined (MIT or CC BY 4.0 recommended, so other awareness trainers can reuse it).
