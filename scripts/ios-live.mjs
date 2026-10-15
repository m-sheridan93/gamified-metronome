// Live reload on a real iPhone: points the iOS app at the Vite dev server on this Mac,
// so saving a file updates the phone without a rebuild. Press Run in Xcode once after
// starting this. Ctrl+C stops the server and points the app back at the built files.
//
// It edits the generated ios/App/App/capacitor.config.json (the same file `cap sync`
// writes), so nothing in the committed config changes.
import {execSync, spawn} from 'node:child_process'
import {readFileSync, writeFileSync} from 'node:fs'
import {networkInterfaces} from 'node:os'

const PORT = 5173
const CONFIG = 'ios/App/App/capacitor.config.json'

// The Mac's address on the local network (Wi-Fi first). The phone must be on the same one.
function lanAddress() {
  const nets = networkInterfaces()
  const names = ['en0', ...Object.keys(nets).filter((n) => n !== 'en0')]
  for (const name of names) {
    const ip = (nets[name] || []).find((a) => a.family === 'IPv4' && !a.internal)
    if (ip) return ip.address
  }
  return null
}

const ip = lanAddress()
if (!ip) {
  console.error('No local network address found. Connect this Mac to Wi-Fi and try again.')
  process.exit(1)
}

// Build and sync first so the app also has up-to-date files to fall back to afterwards.
execSync('vite build && cap sync ios', {stdio: 'inherit'})

const original = readFileSync(CONFIG, 'utf8')
const config = JSON.parse(original)
config.server = {url: `http://${ip}:${PORT}`}
writeFileSync(CONFIG, JSON.stringify(config, null, '\t') + '\n')

console.log(`\nLive reload: the iOS app now loads http://${ip}:${PORT}`)
console.log('Press Run in Xcode (once). Keep the phone on the same Wi-Fi as this Mac.')
console.log('Ctrl+C to stop; then press Run again to go back to the built app.\n')

const vite = spawn('vite', ['--host', '--port', String(PORT), '--strictPort'], {stdio: 'inherit'})

let restored = false
function restore() {
  if (restored) return
  restored = true
  writeFileSync(CONFIG, original)
  console.log('\nLive reload off: the iOS app points at the built files again.')
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    restore()
    vite.kill(signal)
  })
}
vite.on('exit', (code) => {
  restore()
  process.exit(code ?? 0)
})
