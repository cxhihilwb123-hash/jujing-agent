import assert from 'node:assert/strict'
import path from 'node:path'

import { test } from 'vitest'

import { buildJujingGitBashCandidates, resolveJujingHome } from './jujing-paths'

test('resolveJujingHome prefers the branded override', () => {
  assert.equal(
    resolveJujingHome({
      env: { JUJING_HOME: '/data/jujing', HERMES_HOME: '/data/hermes' },
      homeDir: '/home/user',
      isPackaged: true,
      isWindows: false
    }),
    path.resolve('/data/jujing')
  )
})

test('resolveJujingHome ignores an upstream HERMES_HOME in packaged builds', () => {
  assert.equal(
    resolveJujingHome({
      env: { HERMES_HOME: '/data/hermes' },
      homeDir: '/home/user',
      isPackaged: true,
      isWindows: false
    }),
    path.join('/home/user', '.jujing-agent')
  )
})

test('resolveJujingHome accepts HERMES_HOME only for development', () => {
  assert.equal(
    resolveJujingHome({
      env: { HERMES_HOME: '/data/hermes' },
      homeDir: '/home/user',
      isPackaged: false,
      isWindows: false
    }),
    path.resolve('/data/hermes')
  )
})

test('resolveJujingHome uses product-owned defaults and test sandbox', () => {
  assert.equal(
    resolveJujingHome({ env: {}, homeDir: '/home/user', isPackaged: true, isWindows: false }),
    path.join('/home/user', '.jujing-agent')
  )
  assert.equal(
    resolveJujingHome({
      env: { LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local' },
      homeDir: 'C:\\Users\\me',
      isPackaged: true,
      isWindows: true
    }),
    path.join('C:\\Users\\me\\AppData\\Local', 'jujing-agent')
  )
  assert.equal(
    resolveJujingHome({
      env: {},
      homeDir: '/home/user',
      isPackaged: true,
      isWindows: false,
      userDataOverride: '/tmp/desktop-test'
    }),
    path.join(path.resolve('/tmp/desktop-test'), 'jujing-home')
  )
})

test('buildJujingGitBashCandidates prioritizes configured and branded paths', () => {
  const candidates = buildJujingGitBashCandidates({
    configured: 'D:\\Git\\bin\\bash.exe',
    hermesHome: 'D:\\Jujing',
    localAppData: 'C:\\Users\\me\\AppData\\Local',
    programFiles: 'C:\\Program Files',
    programFilesX86: 'C:\\Program Files (x86)'
  })

  assert.deepEqual(candidates.slice(0, 4), [
    'D:\\Git\\bin\\bash.exe',
    path.join('D:\\Jujing', 'git', 'bin', 'bash.exe'),
    path.join('D:\\Jujing', 'git', 'usr', 'bin', 'bash.exe'),
    path.join('C:\\Users\\me\\AppData\\Local', 'jujing-agent', 'git', 'bin', 'bash.exe')
  ])
  assert.ok(candidates.includes(path.join('C:\\Users\\me\\AppData\\Local', 'hermes', 'git', 'bin', 'bash.exe')))
})
