# Desert dusk

A theme for Claude Code on desktop: warm sand and terracotta by day, ember tones at night, with a painted backdrop of towering sunset clouds over soft dunes and a lone cloaked walker.

The backdrop follows the app's light or dark mode and stops moving when your system asks for reduced motion.

## Install

In the desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `AbdullahJYousef/desert-dusk`, then **Add plugin**.

At the prompt of a terminal session:

```
/plugin install desert-dusk --marketplace AbdullahJYousef/desert-dusk
```

Answer `y` to add the marketplace, then pick a scope (the user scope loads the theme in every session).

From a shell:

```
claude plugin install desert-dusk --marketplace AbdullahJYousef/desert-dusk
```

## Changing it

The palette is in `hooks/register.tsx` and the backdrop is drawn in `hooks/scene.js`.
