/**
 * Studio item catalog. Data-driven: add gear by adding an entry.
 * `cost` is in points; `icon` is any Material Design Icon name.
 * Costs are intentionally low for now so the loop is easy to exercise.
 */
export const ITEMS = [
  { id: 'amp-basic', name: 'Practice Amp', cost: 3, icon: 'mdi-amplifier' },
  { id: 'monitors', name: 'Studio Monitors', cost: 6, icon: 'mdi-speaker' },
  { id: 'mic', name: 'Condenser Mic', cost: 10, icon: 'mdi-microphone' },
  { id: 'guitar', name: 'Electric Guitar', cost: 15, icon: 'mdi-guitar-electric' },
  { id: 'rack', name: 'Rack Unit', cost: 25, icon: 'mdi-server' },
  { id: 'grand-piano', name: 'Grand Piano', cost: 50, icon: 'mdi-piano' },
]
