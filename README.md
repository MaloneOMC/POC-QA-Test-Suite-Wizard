# QA Intelligence Suite

A self-contained Quality Assurance software suite for drafting test plans, building test suites and scripts, analyzing PM documentation for risk, identifying knowledge gaps, and exporting reports.

## How to run

Open `index.html` in a browser.

No install step is required. The app runs entirely in the browser. Draft QA work is kept in `localStorage` so the proof of concept does not lose in-progress form content on refresh.

## Major sections

- Dashboard: project profile, readiness snapshot, and one-click QA package generation.
- Test Plans: AI-assisted test plan and suite generation.
- Test Scripts: manual, Gherkin, or hybrid test script output.
- Risk Analysis: documentation upload/paste area with high-risk item and knowledge-gap reporting. Text-based files are parsed directly; binary PM files are logged with guidance to paste extracted text.
- Reports: compiled Markdown report with selectable sections.

## Save states

The app has two save-state concepts:

- Project handoff save states: use the **Project Save State** button in the GUI to download a dated, versioned JSON package that can be pasted into another Codex instance to recreate or continue the same application.
- Code progression save states: the `save-states` folder records dated, versioned snapshots of code changes made by Codex.

User-entered QA form data is not included in the handoff save state. It is only retained locally by the browser during proof-of-concept use.

## AI behavior

This first version uses a local, browser-side QA analysis engine so it works without external credentials. It is structured so a future backend can replace or augment the local generator with an OpenAI, Azure OpenAI, or internal model endpoint, including server-side parsing for PDF, DOCX, PPTX, and XLSX files.
