import path from 'node:path'

import { normalizeHermesHomeRoot } from './backend-env'

interface ResolveJujingHomeOptions {
  env?: NodeJS.ProcessEnv
  homeDir: string
  isPackaged: boolean
  isWindows: boolean
  userDataOverride?: string | null
}

/** Resolve the branded desktop home without inheriting an upstream CLI home. */
export function resolveJujingHome({
  env = process.env,
  homeDir,
  isPackaged,
  isWindows,
  userDataOverride
}: ResolveJujingHomeOptions): string {
  const explicitJujingHome = env.JUJING_HOME || env.JUJING_AGENT_HOME

  if (explicitJujingHome) {
    return normalizeHermesHomeRoot(explicitJujingHome)
  }

  if (!isPackaged && env.HERMES_HOME) {
    return normalizeHermesHomeRoot(env.HERMES_HOME)
  }

  if (userDataOverride) {
    return path.join(path.resolve(userDataOverride), 'jujing-home')
  }

  if (isWindows && env.LOCALAPPDATA) {
    return path.join(env.LOCALAPPDATA, 'jujing-agent')
  }

  return path.join(homeDir, isWindows ? path.join('AppData', 'Local', 'jujing-agent') : '.jujing-agent')
}

interface JujingGitBashCandidateOptions {
  configured?: string | null
  hermesHome: string
  localAppData?: string | null
  programFiles?: string | null
  programFilesX86?: string | null
}

/** Build the ordered Windows Git Bash search path for the branded desktop. */
export function buildJujingGitBashCandidates({
  configured,
  hermesHome,
  localAppData,
  programFiles,
  programFilesX86
}: JujingGitBashCandidateOptions): string[] {
  const candidates: string[] = []

  if (configured) {
    candidates.push(configured)
  }

  candidates.push(path.join(hermesHome, 'git', 'bin', 'bash.exe'))
  candidates.push(path.join(hermesHome, 'git', 'usr', 'bin', 'bash.exe'))

  if (localAppData) {
    candidates.push(path.join(localAppData, 'jujing-agent', 'git', 'bin', 'bash.exe'))
    candidates.push(path.join(localAppData, 'jujing-agent', 'git', 'usr', 'bin', 'bash.exe'))
    candidates.push(path.join(localAppData, 'hermes', 'git', 'bin', 'bash.exe'))
    candidates.push(path.join(localAppData, 'hermes', 'git', 'usr', 'bin', 'bash.exe'))
  }

  candidates.push(path.join(programFiles || 'C:\\Program Files', 'Git', 'bin', 'bash.exe'))
  candidates.push(path.join(programFilesX86 || 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'))

  if (localAppData) {
    candidates.push(path.join(localAppData, 'Programs', 'Git', 'bin', 'bash.exe'))
  }

  return candidates
}
