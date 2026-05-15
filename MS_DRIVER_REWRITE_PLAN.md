# MS Driver Rewrite Plan

## Project Goal

Remix the original Night Drive Three.js game into **MS Driver**, an accessible, relaxing driving game designed for people with multiple sclerosis and similar accessibility needs.

The goal is not to immediately rewrite the whole project. Preserve the existing working Three.js driving foundation, then modify it in safe, testable stages.

---

## Current Base

This repo is based on Night Drive, an exploratory Three.js driving project.

Existing strengths:

- Three.js 3D driving scene
- Procedural road/environment generation
- Car model built from primitive shapes
- Collision detection
- Health/fuel-style UI slot
- Distance tracking
- Score/high score tracking
- Basic settings modal
- Mouse and touch movement input

Existing limitations:

- No modern build system
- Global JavaScript structure
- Browser-loaded scripts through `index.html`
- No package.json
- No automated tests
- Limited mobile/touch polish
- Accessibility features are not yet implemented

---

## New Game Identity

Working title: **MS Driver**

Theme:

A calming nighttime drive where the player manages energy, focus, obstacles, and route choices. The game should feel supportive rather than punishing.

Target audience:

- Adults 45+
- People with multiple sclerosis
- People with fatigue, tremor, dexterity issues, or cognitive overload
- Casual mobile and browser players

Tone:

- Calm
- Encouraging
- Clear
- Low-stress
- Not infantilizing

---

## Core Design Pillars

### 1. Accessibility First

Every feature should support:

- Large readable UI
- High contrast mode
- Reduced motion mode
- One-touch/simple steering option
- Keyboard, mouse, touch, and controller-friendly input
- Adjustable game speed
- Forgiving collision system
- Clear feedback without visual clutter

### 2. Gentle Challenge

Avoid harsh failure loops.

Instead of instant failure:

- Collisions reduce energy
- Energy can recover through safe driving
- Rest stops allow recovery
- Difficulty adapts slowly
- Player can choose a relaxed mode

### 3. Cognitive Benefit Without Feeling Clinical

Micro-challenges should feel like game events, not medical tests.

Possible cognitive mechanics:

- Pattern recognition road signs
- Memory route choices
- Reaction timing gates
- Visual scanning for safe lanes
- Calm focus streaks

### 4. Preserve the Existing Working Game

Do not rebuild from scratch unless necessary.

Make changes in this order:

1. Rename/reskin identity
2. Improve UI clarity
3. Add accessibility settings
4. Add simple input modes
5. Add new gameplay systems
6. Refactor architecture only after behavior is stable

---

## Recommended Sprint Order

## Sprint 1: Identity and Safety Pass

Goal: Make the repo clearly become MS Driver without breaking gameplay.

Tasks:

- Change page title from `Night Drive` to `MS Driver`
- Update README to describe MS Driver
- Add visible title text or title image for MS Driver
- Keep original credits/license references intact
- Confirm the game still loads from `index.html`
- Do not change collision/gameplay yet

Files likely involved:

- `index.html`
- `README.md`
- `css/index.css`
- `img/` assets if title images are replaced

Acceptance criteria:

- Browser tab says `MS Driver`
- Main menu clearly says `MS Driver`
- Play button still starts game
- No console-breaking errors from the rename

---

## Sprint 2: Accessibility Settings

Goal: Add basic accessibility settings without changing the driving loop.

Settings to add:

- High Contrast: ON/OFF
- Reduced Motion: ON/OFF
- Game Speed: Relaxed / Normal
- Steering Mode: Pointer / One Touch
- UI Size: Normal / Large

Implementation guidance:

- Store settings in a global object first
- Save settings with cookies or localStorage
- Apply CSS classes to `body`
- Keep settings simple before refactoring

Acceptance criteria:

- Settings appear in the modal
- Settings can be changed and saved
- Large UI increases HUD readability
- High contrast improves UI visibility
- Relaxed speed starts the game slower

---

## Sprint 3: Input Improvements

Goal: Make the game easier for tremor/dexterity limitations.

Add:

- Keyboard left/right support
- Touch left/right zones
- Optional one-touch lane switching
- Input smoothing
- Dead zone to reduce jitter

Acceptance criteria:

- Player can steer without mouse precision
- Touch works on mobile browser
- One-touch mode moves between lanes or soft target positions
- Existing pointer steering still works

---

## Sprint 4: Energy System

Goal: Replace harsh health framing with MS-friendly energy management.

Rename concepts:

- `health` becomes `energy`
- collisions reduce energy
- safe driving slowly restores energy
- rest pickups restore energy

Acceptance criteria:

- UI says `Energy`, not `Fuel` or generic health
- Collision reduces energy
- Energy can recover slowly
- Game over messaging is gentle, such as `Time to Rest`

---

## Sprint 5: Cognitive Micro-Events

Goal: Add light puzzle-like events without interrupting the drive too much.

Possible event types:

1. Match the glowing road sign
2. Choose the remembered route symbol
3. Follow the calm color path
4. Avoid visual clutter hazards
5. Stop at rest markers for energy recovery

Acceptance criteria:

- At least one simple micro-event appears during play
- It has clear instructions
- Failure is forgiving
- Success gives energy, score, or multiplier

---

## Code Style Rules for AI Agents

When editing this repo:

- Preserve the current script-loading structure unless specifically migrating to Vite/npm
- Avoid massive rewrites in one pass
- Make small commits
- Keep the game playable after every sprint
- Do not remove original working systems until replacements are tested
- Prefer readable code over clever abstractions
- Use comments for accessibility-specific logic

---

## Known Files

Important entry points:

- `index.html` loads CSS, images, libraries, and all game scripts
- `js/index.js` is the main runtime entry point and game loop
- `js/game.js` contains game state, start/end logic, score, health, and UI updates
- `js/Environment.js` likely controls road, sky, obstacles, and generation
- `js/Car.js` controls the car object and animation
- `css/index.css` controls main UI styling
- `css/stars.css` controls star background styling

---

## First Safe Code Changes to Make

1. Update `index.html` title to `MS Driver`
2. Add visible menu title text above the play button
3. Change HUD label from `Fuel` to `Energy`
4. Update README with the MS Driver concept
5. Add an accessibility section to the settings modal

---

## Definition of Done for MVP

The MVP is complete when:

- Game runs in browser from static files
- Main identity says MS Driver
- Player can start and drive
- Player can use at least one accessible input option
- UI has high contrast and large text options
- Energy system is forgiving
- Game has a calm rest/recovery loop
- It can be deployed as a static site on Netlify

---

## Netlify Notes

This project appears to be a static browser game, not a Node/Vite app.

Likely Netlify settings:

- Build command: leave blank
- Publish directory: repository root

If a build system is added later, update this section.
