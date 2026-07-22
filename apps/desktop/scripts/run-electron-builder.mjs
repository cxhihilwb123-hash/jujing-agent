// Resolve electronDist at runtime (#38673, #47917): electron-builder 26.8.x can
// re-unpack a broken Electron.app; reusing the installed dist dodges that.
// npm workspace hoisting is non-deterministic — require.resolve finds electron
// wherever it landed. Dist present → -c.electronDist=<abs>/dist; absent → let
// electron-builder fetch via @electron/get (electronVersion + ELECTRON_MIRROR).

import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

function electronDistDir() {
  try {
    return path.join(path.dirname(require.resolve("electron/package.json")), "dist")
  } catch {
    return null
  }
}

function distBinary(dist) {
  if (process.platform === "darwin") {
    return path.join(dist, "Electron.app", "Contents", "MacOS", "Electron")
  }
  if (process.platform === "win32") {
    return path.join(dist, "electron.exe")
  }
  return path.join(dist, "electron")
}

function explicitTargetPlatforms(argv) {
  const targets = new Set()
  for (const arg of argv) {
    if (arg === '--mac' || arg === '-m' || arg.startsWith('--mac=')) targets.add('darwin')
    if (arg === '--win' || arg === '-w' || arg.startsWith('--win=')) targets.add('win32')
    if (arg === '--linux' || arg === '-l' || arg.startsWith('--linux=')) targets.add('linux')
  }
  return targets
}

function canReuseLocalElectronDist(argv) {
  const targets = explicitTargetPlatforms(argv)
  // No explicit platform means electron-builder targets the current host.
  if (targets.size === 0) return true
  return targets.size === 1 && targets.has(process.platform)
}

function electronBuilderCli() {
  const pkgJson = require.resolve("electron-builder/package.json")
  const bin = require(pkgJson).bin
  const rel = typeof bin === "string" ? bin : bin["electron-builder"]
  return path.join(path.dirname(pkgJson), rel)
}

const dist = electronDistDir()
const cliArgs = process.argv.slice(2)
const args = []
if (canReuseLocalElectronDist(cliArgs) && dist && fs.existsSync(distBinary(dist))) {
  args.push(`-c.electronDist=${dist}`)
} else {
  console.warn(
    "[run-electron-builder] using electron-builder managed Electron download " +
      "(cross-platform target or no reusable local dist)."
  )
}
args.push(...cliArgs)

const result = spawnSync(process.execPath, [electronBuilderCli(), ...args], {
  stdio: "inherit",
})
if (result.error) {
  console.error(`[run-electron-builder] spawn failed: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status == null ? 1 : result.status)
