# Profitable Contribution

> A lightweight, dependency-free deposit selector that finds the bank deposit yielding the **highest projected balance** for your money.

[![Deploy to GitHub Pages](https://github.com/Elkhan-Isayev/profitable-contribution-js/actions/workflows/deploy.yml/badge.svg)](https://github.com/Elkhan-Isayev/profitable-contribution-js/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[➜ Live demo](https://elkhan-isayev.github.io/profitable-contribution-js/)**

## Overview

Profitable Contribution is a single-page application written in plain HTML, CSS
and modern JavaScript — **no frameworks, no build step, no dependencies**. You
enter four parameters and the app compares them against a built-in catalogue of
bank deposits, projects the final balance for every eligible product, and shows
you the option (or options) that earn the most.

It started as a coding-bootcamp assignment and was refurbished into a clean,
class-based, portfolio-ready project.

## Features

- 🔎 **Filters** the deposit catalogue by currency, amount limits, term and
  whether top-ups are allowed.
- 📈 **Projects the final balance** with monthly compounding plus optional
  monthly top-ups.
- 🏆 **Highlights the winner(s)** — every deposit tied for the highest projected
  balance is shown.
- ✅ **Inline validation** with clear, field-specific error messages.
- 📱 **Responsive** layout that works on phones and desktops.
- ⚡ **Zero dependencies** — just open `index.html`.

## How it works

Given your inputs, the app:

1. **Validates** the four required fields.
2. **Filters** the catalogue (`js/data.js`) down to deposits you are eligible
   for — matching currency, within the min/max amount, within the min/max term,
   and (if you plan monthly top-ups) only deposits that allow them.
3. **Projects** the final balance for each remaining deposit using monthly
   compounding:

   ```text
   for each month in term:
       balance += balance * (annualRate / 100 / 12) + monthlyTopUp
   ```

4. **Sorts** the results and displays every deposit tied for the best projected
   balance.

> ⚠️ This is an educational projection, not financial advice. Real deposits have
> additional terms (capitalization rules, taxes, fees) that are not modelled here.

## Inputs

| Field            | Description                                  | Constraints                  |
| ---------------- | -------------------------------------------- | ---------------------------- |
| Initial amount   | The sum you deposit up front                 | Number ≥ 0                   |
| Monthly top-up   | Amount added every month (0 for none)        | Number ≥ 0                   |
| Term (months)    | How long the money stays deposited           | Positive whole number        |
| Currency         | Deposit currency                             | `RUB` or `USD`               |

## Getting started

No installation required — the project is fully static.

**Option 1 — open directly**

```bash
git clone https://github.com/Elkhan-Isayev/profitable-contribution-js.git
cd profitable-contribution-js
open index.html        # or just double-click the file
```

**Option 2 — serve locally** (recommended, avoids any file:// quirks)

```bash
# Python 3
python3 -m http.server 8080

# or Node.js
npx serve .
```

Then visit <http://localhost:8080>.

## Project structure

```text
profitable-contribution-js/
├── index.html            # Markup and form
├── css/
│   └── style.css         # Styling (responsive, theme variables)
├── js/
│   ├── data.js           # Bank-deposit catalogue (data source)
│   └── script.js         # App logic (class-based)
├── assets/               # Background image
└── .github/workflows/    # GitHub Pages deployment
```

### Code design

`js/script.js` is organised into small, single-purpose classes:

| Class                | Responsibility                                             |
| -------------------- | --------------------------------------------------------- |
| `Application`        | Wires up the form and orchestrates a run.                 |
| `Deposit`            | Reads and normalises the user's input.                    |
| `Validator`          | Validates input and collects error messages.              |
| `Parser`             | Turns raw catalogue data into `BankProduct` objects.      |
| `Calculator`         | Filters, projects balances, and ranks deposits.           |
| `BankProduct`        | A single deposit offer from the catalogue.                |
| `RecommendedProduct` | A computed result row.                                     |
| `Artisan`            | Renders the table, messages and validation errors.        |

## Deployment

The site deploys automatically to **GitHub Pages** on every push to `master`
via the workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
To enable it on a fork, go to **Settings → Pages → Build and deployment** and set
the source to **GitHub Actions**.

## Tech stack

- HTML5
- CSS3 (custom properties, flexbox, responsive media queries)
- Vanilla JavaScript (ES6+ classes, no frameworks)

## License

Released under the [MIT License](LICENSE).
