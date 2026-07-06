import { computed } from 'vue'
import { ITEMS } from '../data/items'
import { state, persistNow, useProgress } from './useProgress'

/**
 * Shop + studio inventory. Reads/writes the `inventory` slice of the shared
 * progress blob, and spends points through useProgress so the wallet stays
 * the single source of truth.
 */
export function useStudio() {
  const { spend } = useProgress()

  const isOwned = (id) => !!state.inventory[id]?.owned
  const ownedItems = computed(() => ITEMS.filter((item) => isOwned(item.id)))

  /** Buy an item. Returns 'owned' | 'insufficient' | 'ok'. */
  function buy(item) {
    if (isOwned(item.id)) return 'owned'
    if (!spend(item.cost)) return 'insufficient'
    state.inventory[item.id] = { owned: true, placed: true }
    persistNow()
    return 'ok'
  }

  return { ITEMS, isOwned, ownedItems, buy }
}
