/**
 * after-pack.mjs — electron-builder afterPack hook.
 *
 * Performs platform-specific post-staging fixes before signing / final
 * artifact creation:
 *
 *   - Windows: stamp the Jujing icon + identity onto the packed exe via
 *     rcedit (delegated to set-exe-identity.mjs).
 *   - macOS: strip FinderInfo/resource-fork/provenance-style extended
 *     attributes from the .app bundle before codesign runs.
 *
 * The Windows identity stamp is best-effort: a stamp failure must never fail an
 * otherwise-good build (worst case is the stock icon, not a broken app), so we
 * log and resolve rather than throw.
 *
 * The macOS xattr cleanup is load-bearing. Without it, cloud-backed folders and
 * Finder can attach com.apple.FinderInfo / resource-fork metadata to staged
 * Electron helpers, and codesign then fails with:
 *
 *   resource fork, Finder information, or similar detritus not allowed
 *
 * electron-builder passes a context with:
 *   - electronPlatformName: 'win32' | 'darwin' | 'linux'
 *   - appOutDir:            the unpacked app directory for this target
 *   - packager.appInfo.productFilename: the exe basename (e.g. '巨鲸智能体')
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { stampExeIdentity } from './set-exe-identity.mjs'

async function stampWindowsExe(context) {
  const productName = context.packager?.appInfo?.productFilename || '巨鲸智能体'
  const exe = path.join(context.appOutDir, `${productName}.exe`)
  const desktopRoot = path.resolve(import.meta.dirname, '..')

  try {
    await stampExeIdentity(exe, desktopRoot)
  } catch (err) {
    // Never fail the build over a cosmetic stamp.
    console.warn(
      `[after-pack] exe identity stamp failed (${err.message}); ${productName}.exe keeps the stock Electron icon`
    )
  }
}

function cleanMacBundleExtendedAttributes(context) {
  const appOutDir = context.appOutDir
  if (!appOutDir || typeof appOutDir !== 'string' || !fs.existsSync(appOutDir)) {
    return
  }

  const appName = fs.readdirSync(appOutDir).find(name => name.endsWith('.app'))
  if (!appName) {
    return
  }

  const appPath = path.join(appOutDir, appName)
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'jujing-mac-app-clean.'))
  const cleanAppPath = path.join(tempRoot, appName)

  try {
    execFileSync('/usr/bin/ditto', ['--noextattr', '--norsrc', appPath, cleanAppPath], { stdio: 'pipe' })
    fs.rmSync(appPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    execFileSync('/usr/bin/ditto', ['--noextattr', '--norsrc', cleanAppPath, appPath], { stdio: 'pipe' })
    console.log(`[after-pack] stripped macOS extended attributes before signing: ${appPath}`)
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
}

export { cleanMacBundleExtendedAttributes }

export default async function afterPack(context) {
  if (context.electronPlatformName === 'darwin') {
    cleanMacBundleExtendedAttributes(context)
    return
  }

  if (context.electronPlatformName === 'win32') {
    await stampWindowsExe(context)
  }
}
