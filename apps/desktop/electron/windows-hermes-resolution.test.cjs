'use strict'

// Regression guards for Windows `hermes` resolution in main.cjs.
//
// main.cjs has no module.exports, so these follow the repo's source-assertion
// test pattern (see windows-child-process.test.cjs). They pin the two Windows
// resolution bugs that caused desktop reinstall loops:
//   1. findOnPath() tried the empty extension FIRST, so an extensionless
//      Git-Bash `hermes` shim shadowed the real hermes.cmd/hermes.exe; the
//      shim then failed the --version probe and the desktop fell through to a
//      spurious bootstrap/repair.
//   2. handOffWindowsBootstrapRecovery() chose --update vs the destructive
//      --repair by checking ONLY venv\Scripts\hermes.exe (the console-script
//      shim, written at the END of venv setup and absent in interrupted
//      states), so it escalated to a full venv recreate even on healthy
//      installs.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readMain() {
  return fs.readFileSync(path.join(__dirname, 'main.cjs'), 'utf8').replace(/\r\n/g, '\n')
}

function readInstallPs1() {
  return fs.readFileSync(path.join(__dirname, '..', '..', '..', 'scripts', 'install.ps1'), 'utf8').replace(/\r\n/g, '\n')
}

test('findOnPath tries PATHEXT extensions before the bare (empty) name on Windows', () => {
  const source = readMain()
  // Fixed order: PATHEXT first, empty string LAST.
  assert.match(
    source,
    /\(process\.env\.PATHEXT \|\| '\.COM;\.EXE;\.BAT;\.CMD'\)\.split\(';'\)\.filter\(Boolean\), ''\]/,
    'extensions array must end with the empty string, not start with it'
  )
  // The buggy empty-first order must not return.
  assert.doesNotMatch(
    source,
    /\['', \.\.\.\(process\.env\.PATHEXT/,
    'empty-extension-first order regressed: an extensionless shim can shadow hermes.cmd/.exe'
  )
})

test('Windows bootstrap recovery chooses --update when any real-install signal is present', () => {
  const source = readMain()
  assert.match(source, /const haveRealInstall =/, 'recovery must compute haveRealInstall')
  assert.match(
    source,
    /fileExists\(venvPython\)/,
    'recovery must accept the venv interpreter as a real-install signal'
  )
  assert.match(
    source,
    /\.hermes-bootstrap-complete/,
    'recovery must accept the bootstrap-complete marker as a real-install signal'
  )
  assert.match(
    source,
    /updaterArgs = haveRealInstall \? \['--update'/,
    'updaterArgs must gate on haveRealInstall'
  )
  // The old too-narrow check (only venv\Scripts\hermes.exe) must not return.
  assert.doesNotMatch(
    source,
    /updaterArgs = fileExists\(venvHermes\) \?/,
    'recovery regressed to gating only on the hermes.exe shim, which forces destructive --repair'
  )
})

test('Jujing desktop home is isolated from upstream Hermes CLI defaults', () => {
  const source = readMain()
  assert.match(source, /process\.env\.JUJING_HOME \|\| process\.env\.JUJING_AGENT_HOME/)
  assert.match(source, /'jujing-agent'/, 'Windows default must use the product-owned jujing-agent directory')
  assert.match(source, /'\.jujing-agent'/, 'POSIX default must use the product-owned ~/.jujing-agent directory')
  assert.match(
    source,
    /!IS_PACKAGED && process\.env\.HERMES_HOME/,
    'HERMES_HOME should remain a development-only override'
  )
  assert.doesNotMatch(
    source,
    /readWindowsUserEnvVar\('HERMES_HOME'\)/,
    'packaged desktop must not inherit the upstream CLI HERMES_HOME registry value'
  )
  assert.doesNotMatch(
    source,
    /path\.join\(process\.env\.LOCALAPPDATA, 'hermes'\)/,
    'new Windows installs must not default to the upstream Hermes data directory'
  )
})

test('Windows installer persists JUJING_HOME without rewriting user HERMES_HOME', () => {
  const source = readInstallPs1()
  assert.match(source, /SetEnvironmentVariable\("JUJING_HOME", \$HermesHome, "User"\)/)
  assert.doesNotMatch(
    source,
    /\[string\]\$HermesHome = \$\(if \(\$env:JUJING_HOME\) \{ \$env:JUJING_HOME \} elseif \(\$env:HERMES_HOME\)/,
    'installer default must not inherit an upstream CLI HERMES_HOME'
  )
  assert.doesNotMatch(
    source,
    /SetEnvironmentVariable\("HERMES_HOME", \$HermesHome, "User"\)/,
    'installer must not mutate the upstream CLI HERMES_HOME user variable'
  )
  assert.match(
    source,
    /JUJING_DESKTOP_BOOTSTRAP[\s\S]+without changing user PATH or HERMES_HOME/,
    'desktop bootstrap mode must avoid user-level PATH/HERMES_HOME writes'
  )
})

test('Windows installer keeps SOUL.md persona parser-safe for PowerShell 5.1', () => {
  const source = readInstallPs1()
  assert.match(
    source,
    /\$soulContentBase64 = "[A-Za-z0-9+/=]+"/,
    'persona text should be encoded so Windows PowerShell does not parse Chinese source text'
  )
  assert.doesNotMatch(
    source,
    /\$soulContent\s*=\s*@"[\s\S]*巨鲸智能体[\s\S]*"@/,
    'Chinese here-strings can be misparsed by Windows PowerShell 5.1 when the script is read as ANSI'
  )
})

test('Windows installer script source stays ASCII-only for PowerShell 5.1 parser safety', () => {
  const source = readInstallPs1()
  const nonAsciiLines = source
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /[^\x00-\x7F]/.test(line))

  assert.deepEqual(
    nonAsciiLines,
    [],
    'install.ps1 must stay ASCII-only; runtime-decode localized strings instead'
  )
})
