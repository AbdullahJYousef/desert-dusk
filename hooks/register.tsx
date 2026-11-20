import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// Warm sand and terracotta by day; ember-lit dunes after sundown.
const { theme, problems } = makeColors({
  label: 'Desert dusk',
  roles: { accent: '#c2562e', danger: '#b8322a', success: '#5f7f3a', warning: '#b07a12', pro: '#8a4f7d' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#ecdcc0',
        'surface-1': '#f2e5cd',
        'surface-2': '#f8eedb',
        'text-primary': '#2e1f14',
        'text-secondary': '#57402f',
        'text-muted': '#6b5340',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1c1210',
        'surface-1': '#251814',
        'surface-2': '#2e1e19',
        'surface-3': '#35231d',
        'text-primary': '#f4e3cc',
        'text-secondary': '#d6bfa4',
        'text-muted': '#b39a80',
      },
    },
    roles: { accent: '#e8824a' },
  },
})


const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'dunes', glass: { blur: 14, opacity: 0.66 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // The one kind of problem that stops Desktop painting the look at all.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Towering sunset clouds over soft dunes, with a lone cloaked walker"
        isInteractive
      />
    )
  })
}
