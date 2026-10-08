import { computed } from 'vue'
import { state } from './useProgress'
import { todayISO, startOfWeekISO } from '../lib/storage'

/**
 * Daily / weekly practice challenges.
 *
 * Challenges are entirely DERIVED from the practice history in `state.dailySeconds` —
 * nothing extra is stored. Progress and completion recompute reactively, and daily/
 * weekly targets "reset" automatically because they only ever read today's bucket or
 * this week's buckets.
 */

const DEFINITIONS = [
  {
    id: 'daily-10',
    period: 'Daily',
    title: 'Warm-up',
    description: 'Practise 10 minutes today',
    compute: (ctx) => ({ current: ctx.todaySeconds, target: 600, unit: 'time' }),
  },
  {
    id: 'weekly-days',
    period: 'Weekly',
    title: 'Consistency',
    description: 'Practise on 5 days this week',
    compute: (ctx) => ({ current: ctx.weekDays, target: 5, unit: 'days' }),
  },
  {
    id: 'weekly-time',
    period: 'Weekly',
    title: 'Put in the hours',
    description: 'Practise 2 hours this week',
    compute: (ctx) => ({ current: ctx.weekSeconds, target: 7200, unit: 'time' }),
  },
]

function formatProgress(current, target, unit) {
  if (unit === 'days') return `${Math.floor(current)} / ${target} days`
  // time, in minutes or hours depending on the target size
  if (target >= 3600) {
    return `${(current / 3600).toFixed(1)} / ${(target / 3600).toFixed(1)} h`
  }
  return `${Math.floor(current / 60)} / ${Math.round(target / 60)} min`
}

export function useChallenges() {
  const challenges = computed(() => {
    const weekStart = startOfWeekISO()
    const ctx = {
      todaySeconds: state.dailySeconds[todayISO()] || 0,
      weekSeconds: 0,
      weekDays: 0,
    }
    for (const [date, secs] of Object.entries(state.dailySeconds)) {
      if (date >= weekStart && secs > 0) {
        ctx.weekSeconds += secs
        ctx.weekDays += 1
      }
    }

    return DEFINITIONS.map((def) => {
      const { current, target, unit } = def.compute(ctx)
      const percent = Math.min(100, (current / target) * 100)
      return {
        id: def.id,
        period: def.period,
        title: def.title,
        description: def.description,
        percent,
        done: current >= target,
        text: formatProgress(current, target, unit),
      }
    })
  })

  const dailyChallenges = computed(() => challenges.value.filter((c) => c.period === 'Daily'))
  const weeklyChallenges = computed(() => challenges.value.filter((c) => c.period === 'Weekly'))

  return { challenges, dailyChallenges, weeklyChallenges }
}
