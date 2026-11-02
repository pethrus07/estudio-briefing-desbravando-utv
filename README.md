# Briefing Studio · Desbravando UTV

[Português](README.pt-BR.md) · English

Two tools for Desbravando UTV, an off-road UTV expedition operator, in one repository:

1. **Briefing Studio** (`index.html`): a single offline HTML file. A guided form turns an
   expedition brief into a structured `.zip` (photos, `expedicao.json`, brand kit,
   instructions) built in the browser.
2. **Art factory** (`artes/`): Node and Python scripts that render print and social pieces
   (badges, stickers, flags, menus, expedition dossier, schedules) from HTML/CSS templates
   to PDF and PNG, with automatic checks on each PDF.

## Status

Active. The Studio runs in production on Cloudflare Pages (`estudio-briefing.pages.dev`).
The art factory runs locally.

`main` matches production: the meeting mode wizard (`feat/modo-reuniao`) was merged on
2026-11-01. The only difference is the two Mini Drive keys, which stay empty here.

## The problem it solves

Briefs for each expedition used to arrive scattered over chat and e-mail, and every piece of
art needed several rounds of questions. The Studio collects the brief once, in a fixed
structure. The art factory turns structured data into finished files with the real brand
fonts and logos, and refuses a PDF whose numbers do not match the data.

## Stack

- Studio: HTML, CSS and JavaScript in one file, JSZip, no build, no backend
- Art factory: Node.js ES modules, headless Chrome (PDF), PyMuPDF (PNG and PDF checks)

## Run locally

- Studio: open `index.html` in a browser. No server needed.
- Art factory: `npm run artes -- <piece>` (for example `npm run artes -- bandeira`).
  It reads client data from a folder outside the repository; see
  [artes/README.md](artes/README.md), section "Onde ficam os dados".

## Tests

```bash
npm test
```

Checks that the Studio's JavaScript compiles, that the Mini Drive keys are empty in the
repository, that no client data is tracked, and that the data path resolver works. Each
commercial PDF of the art factory is also audited by its own script when rendered.

## Folder structure

| Path | What it is |
|---|---|
| `index.html` | The Briefing Studio |
| `docs/app/` | Studio technical map, expansion plan, July review notes |
| `artes/` | Art factory: `templates/`, `ferramentas/`, brand, photos with credits |
| `artes/saida/` | Rendered files (ignored by git) |
| `tests/` | Automated checks |
| `docs/arquitetura/` | Diagrams |

## Architecture

Diagrams in [docs/arquitetura/](docs/arquitetura/). Studio internals in
[docs/app/MAPA_TECNICO.md](docs/app/MAPA_TECNICO.md) (Portuguese).

## Decisions and known limits

- Client data (agreement, monthly statements, proposal, team names, partner phones) and the
  billing table live outside the repository since 2026-11-01. The pipeline finds them through
  `DESBRAVANDO_DADOS`.
- The production Studio is a direct upload to Cloudflare Pages, not linked to GitHub. A merge
  does not deploy.
- Two products share this repository. Splitting them is proposed, not done.

## History cleanup (2026-11)

The history was rewritten on 2026-11-01, before the repository was opened. Client data
(`artes/dados/`, `artes/CONTROLE-DE-ARTES.md`), the internal value lists of the auditors,
the expedition photos and the per-piece prices left every commit. They live in a data
folder outside the repository, read through `DESBRAVANDO_DADOS`.

## License

All rights reserved. Published as portfolio; not licensed for reuse. See [LICENSE](LICENSE).
