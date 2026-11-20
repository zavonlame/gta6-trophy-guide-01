# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zavonlame/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zavonlame/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Leonida Platinum: an offline tracker and guide for all 55 Grand Theft Auto VI trophies on PlayStation 5 — a checklist saved in your browser, a roadmap to the platinum, the missables flagged, and a cited guide for each trophy.

## What it does

- **Tracker:** all 55 official trophies with their official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze). Tick each one off; progress is saved in your browser (localStorage) and can be exported to a file and imported back.
- **Filters:** by grade, by kind (story, strangers, activities, collectibles, combat & crime), missable-only, hide-earned, and a text search.
- **Spoiler setting:** hides the names and descriptions of the story trophies until you earn them.
- **Roadmap:** six stages in order, from the story to 100% completion and the platinum.
- **Missables:** the six trophies that read as one-time moments in their official descriptions, each flagged with a warning and treated as missable until confirmed.
- **Guides:** a guide for every trophy in our own words, citing its sources — the official list on Exophase for each name, description and grade, PSNProfiles for PSN progress targets, and a plain note where our advice is our own reading of the official description and not yet verified in the game.

Everything runs offline from its own files: no network requests, no accounts, no tracking.

## How the missables were decided

Six trophies read as one-time moments in their official descriptions — a choice, a retry, a one-off event at the airport, a quiet moment on Ocean Beach, a showroom set-piece, a strange event in the world. This guide flags those six as missable and says so plainly, because the game launched days ago and none of them is confirmed in the game yet. Every other trophy is tied to a story mission (replayable), an activity, a collectible or a shop that stays open, so it can be earned after the story at your own pace.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Or serve `app/` with any static file server.

To hand in the guide the way the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## Sources & honesty notes

- Trophy names, descriptions and grades: the official PlayStation 5 list, as published by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/).
- PSN progress targets: [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).
- Every guide is our own reading of the official descriptions, written for this guide — not yet verified in the game. Where a place or step is not pinned down, the guide says so instead of guessing.
- Unofficial fan guide. Not affiliated with, endorsed by, or connected to Rockstar Games or PlayStation. No Rockstar logo or official artwork is used here.

---

Entered on [make.fun](https://make.fun/?ref=ye09dzcs&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
