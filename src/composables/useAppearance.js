import { computed, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { state, persistNow } from './useProgress'

/**
 * Light / dark mode: follow the phone, or force one. The choice is saved in
 * `settings.appearance`; 'system' (the default) follows the phone's setting.
 */

export const APPEARANCES = [
  { value: 'system', title: 'Match phone', icon: 'mdi-theme-light-dark' },
  { value: 'light', title: 'Light', icon: 'mdi-white-balance-sunny' },
  { value: 'dark', title: 'Dark', icon: 'mdi-weather-night' },
]

/** The saved choice, for setting the theme before the app mounts. */
export function savedAppearance() {
  const saved = state.settings.appearance
  return APPEARANCES.some((a) => a.value === saved) ? saved : 'system'
}

export function useAppearance() {
  const theme = useTheme()
  const appearance = computed(() => savedAppearance())
  const current = computed(() => APPEARANCES.find((a) => a.value === appearance.value))

  function setAppearance(value) {
    state.settings.appearance = value
    theme.change(value)
    persistNow()
  }

  // Keep the page behind the app (iOS overscroll, safe areas) on the same mode as the
  // app, even when it differs from the phone's setting. See style.css.
  watchEffect(() => {
    document.documentElement.dataset.theme = theme.global.name.value
  })

  return { appearance, current, setAppearance }
}
