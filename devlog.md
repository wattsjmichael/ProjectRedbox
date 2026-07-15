# Project Redbox Devlog

## Day 1 — July 15, 2026

Today I started building **Project Redbox**, the first game from **Dadbod Studios**.

The idea came from thinking about the games I keep coming back to and what I actually enjoy about them.

I love the loot hunt and progression of *Phantasy Star Online*. I love the chaos and simplicity of *Vampire Survivors*. And I've always had a soft spot for the top-down action of games like *Loaded*.

So the basic idea became:

> What if I smashed those things together and built a game that focused on killing enemies, finding cool loot, and getting stronger?

The other goal is actually finishing the damn thing.

I have a tendency to think big when I start building games. Big worlds. Complicated systems. Custom art. Animations. Multiplayer.

Then suddenly I'm spending 90% of my development time making assets instead of making a game.

Project Redbox is intentionally different.

I'm giving myself roughly **one hour a day** to work on it. The first goal is a **14-day playable alpha** that I can put on itch.io and send to someone as a link.

No giant engine.

No complicated 3D pipeline.

No spending three weeks animating a character's left foot.

I'm building it with **Phaser, TypeScript, and Vite**.

Today I started with the most technologically advanced protagonist in gaming history:

**A green rectangle.**

And honestly?

It was fun.

### What I built today

* [x] Created the Phaser + TypeScript project
* [x] Added WASD and arrow-key movement
* [x] Added arena boundaries
* [x] Added enemy spawning
* [x] Added enemies that chase the player
* [x] Added automatic targeting
* [x] Added automatic rifle fire
* [x] Added bullet collision
* [x] Added enemy health
* [x] Added hit feedback
* [x] Added enemy deaths
* [x] Added a kill counter
* [x] Added a small particle burst when enemies die
* [x] Added screen shake

So right now the game is:

**Green rectangle runs around.**

**Red rectangles chase green rectangle.**

**Green rectangle shoots yellow rectangles.**

**Red rectangles explode.**

And somehow, the beginnings of the game I imagined are already visible.

The core loop is starting to exist:

> Move → Target → Shoot → Kill

Next comes:

> Kill → XP → Level Up → Get Stronger → Kill More

And eventually:

> Kill → See Red Box → Drop Everything You're Doing → GET THE RED BOX.

That's the part I'm most excited about.

The long-term vision for Project Redbox is a top-down action loot game built around short runs, rare weapon hunting, character progression, and an evolving robotic companion system.

But I'm deliberately not building all of that yet.

The next milestone is simple:

**The player needs to be able to die.**

After that comes XP.

Then leveling.

Then weapons.

Then loot.

Then the **RED BOX**.

Then, if everything goes according to plan, a giant biomechanical dragon is going to try to land on my head.

### The Goal

On **July 28, 2026**, I want Project Redbox playable in a browser on itch.io.

It won't be finished.

It won't be pretty.

But it will be playable.

And if someone plays it and immediately clicks **RUN AGAIN**?

Then we might actually have something.

— Michael
**Dadbod Studios**
