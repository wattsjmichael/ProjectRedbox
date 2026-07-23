# Repository Guidelines

## Project Overview

Project Redbox is a Phaser 3 game built with TypeScript and Vite. Its direction combines PSO-style loot and MAG progression, Vampire Survivors-style runs, and Loaded-style dark top-down sci-fi combat. Combat feel, responsive controls, and exciting loot take priority over abstract architecture.

The game uses a 1280x720 resolution and a 2400x1800 world. Preserve these dimensions unless a requested feature explicitly changes them.

## Structure and Systems

The application is in `project-redbox/`. Source code is organized by feature under `project-redbox/src/`:

- `scenes/` coordinates Phaser screens and game flow.
- `player/`, `enemies/`, `weapons/`, and `encounters/` implement combat.
- `items/`, `loot/`, `inventory/`, `mag/`, `progression/`, and `persistence/` manage rewards and progression.
- `ui/` contains the HUD; assets live in `public/` and `src/assets/`.

Weapons currently include rifle, scattergun, cannon, greatsword, and photon lance. Rare red-box drops must remain important and should feel exciting.

Reuse existing types, systems, and utilities. Preserve working behavior unless the requested feature requires a change. Do not remove working features to simplify implementation, perform unnecessary rewrites, or introduce large architectural changes. Prefer clear, direct implementations.

## State and Persistence

Keep temporary run state separate from persistent progression. Run-only state includes health during a run, encounter state, timers, and run counters. Persistent progression includes the full inventory, equipped weapon, MAG level/XP/stats, and future account progression. Starting a new run must not discard persistent progression.

## Development Commands

Run commands from `project-redbox/`:

```sh
npm install       # Install dependencies
npm run dev       # Start the Vite development server
npm run build     # Type-check and create the production build
npm run preview   # Preview the production build
```

Run `npm run build` after meaningful code changes. Fix every TypeScript error before declaring a task complete. There is currently no automated test suite.

## Style and Validation

Use TypeScript ES modules and two-space indentation. Use `PascalCase` for classes and types, `camelCase` for functions and fields, and feature-oriented filenames such as `InventorySystem.ts`. Follow local formatting and avoid reformatting unrelated code.

Manually test affected gameplay paths: combat responsiveness, loot collection, inventory and MAG interactions, scene transitions, and reload/new-run persistence. After every task, summarize exactly which files changed and provide practical manual testing steps.

## Commits and Pull Requests

Use focused, imperative commit subjects such as `Add inventory persistence`. Pull requests should explain player-visible effects, link relevant work, list verification steps, and include screenshots or recordings for UI changes. Explicitly call out save-format changes.
