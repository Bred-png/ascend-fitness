# Ascend Fitness

+Build a fitness app called "Reborn" — a workout-plan generator inspired by anime hero training, similar in spirit to the Arise fitness app but themed around becoming a hero or a villain, One-Punch-Man style.

CORE CONCEPT

On first launch, the user chooses a path: HERO or VILLAIN. This choice affects the visual theme (colours, icons, workout naming, motivational copy) but both paths use the same underlying training logic — heroes get "Hero Association" styled rank-up language, villains get "Threat Level" styled rank-up language.

ONBOARDING FLOW

Collect:

- Height

- Weight

- Gender

- Available equipment (none/bodyweight only, dumbbells, full gym, resistance bands, pull-up bar, etc. — multi-select)

- Primary goal (build strength, lose weight, build endurance, general fitness, "become the strongest" mode)

- Current fitness level (beginner/intermediate/advanced)

- Days per week available to train

WORKOUT PLAN GENERATION

Based on the above inputs, generate a personalized weekly workout plan:

- Exercises should match available equipment (bodyweight-only users get calisthenics-based plans: push-ups, sit-ups, squats, running — classic "hero training" style)

- Adjust volume/intensity based on weight, height, fitness level, and goal

- Structure as a weekly split with sets/reps/rest times

- Include a simple daily cardio component (running distance/time) as a nod to the training-arc aesthetic

- Allow plan regeneration if equipment or goals change

PROGRESSION / GAMIFICATION SYSTEM

- Rank system with tiers the user climbs as they log workouts consistently (e.g. Rank C → B → A → S for heroes; Threat Level Tiger → Demon → Dragon → God for villains — feel free to invent original tier names, not copied from any show)

- Streak tracking and a simple XP/level bar

- Optional "training log" where users check off daily workouts

- Milestone badges for consistency (e.g. "30-Day Streak," "100 Workouts Logged")

UI / DESIGN DIRECTION

- Hero mode: clean, bright, blue/yellow/white color scheme, bold heroic typography

- Villain mode: dark, red/black/purple color scheme, edgier typography

- Toggle to switch path later if the user wants to change themes (progress carries over)

- Dashboard showing: today's workout, current streak, current rank, weekly progress chart

- Simple, mobile-first, card-based layout

FUNCTIONALITY

- User profile with editable stats (height/weight/equipment/goal) that regenerates the plan when changed

- Workout history log with charts (weight over time, workouts completed per week)

- Rest day handling

- Local storage or simple auth (email/password) to save progress across sessions

Keep exercise naming and rank names ORIGINAL — inspired by the "ordinary person trains hard and becomes powerful" anime trope, but not copying any copyrighted character names, quotes, or show-specific terms.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/78b93eb7-fe7f-4987-ad38-dd48be37978b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
