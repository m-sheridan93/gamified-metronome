import { computed } from 'vue'
import { state, weekTotals } from './useProgress'
import { todayISO } from '../lib/storage'
import { formatDuration, humanDuration, plural } from '../lib/format'

/**
 * Daily / weekly practice challenges.
 *
 * Challenges are entirely DERIVED from the practice history in `state.dailySeconds`,
 * so nothing extra is stored. Progress and completion recompute reactively, and daily/
 * weekly targets "reset" automatically because they only ever read today's bucket or
 * this week's buckets.
 *
 * Targets come from the profile's goals (set during onboarding). Without goals, the
 * original defaults apply.
 */

const DEFAULT_TARGETS = { dailySeconds: 600, weeklyDays: 5, weeklySeconds: 7200 }

/** Challenge targets for the current profile goals. */
export function challengeTargets(goals = state.profile?.goals) {
  if (!goals) return DEFAULT_TARGETS
  return {
    dailySeconds: goals.minutesPerDay * 60,
    weeklyDays: goals.daysPerWeek,
    weeklySeconds: goals.minutesPerDay * goals.daysPerWeek * 60,
  }
}

function buildDefinitions(t) {
  return [
    {
      id: 'daily-time',
      period: 'Daily',
      title: 'Warm-up',
      description: `Practice ${humanDuration(t.dailySeconds)} today`,
      compute: (ctx) => ({ current: ctx.todaySeconds, target: t.dailySeconds, unit: 'time' }),
    },
    {
      id: 'weekly-days',
      period: 'Weekly',
      title: 'Consistency',
      description: `Practice on ${plural(t.weeklyDays, 'day')} this week`,
      compute: (ctx) => ({ current: ctx.weekDays, target: t.weeklyDays, unit: 'days' }),
    },
    {
      id: 'weekly-time',
      period: 'Weekly',
      title: 'Put in the hours',
      description: `Practice ${humanDuration(t.weeklySeconds)} this week`,
      compute: (ctx) => ({ current: ctx.weekSeconds, target: t.weeklySeconds, unit: 'time' }),
    },
  ]
}

function formatProgress(current, target, unit) {
  if (unit === 'days') return `${Math.floor(current)} / ${target} days`
  return `${formatDuration(current)} / ${formatDuration(target)}`
}

export function useChallenges() {
  const challenges = computed(() => {
    const week = weekTotals()
    const ctx = {
      todaySeconds: state.dailySeconds[todayISO()] || 0,
      weekSeconds: week.seconds,
      weekDays: week.days,
    }

    return buildDefinitions(challengeTargets()).map((def) => {
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
