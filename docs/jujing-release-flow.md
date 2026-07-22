# Jujing Agent Release Flow

This repository is the Jujing-branded distribution of Hermes Agent.

## Remotes

- `origin`: `git@github.com:cxhihilwb123-hash/jujing-agent.git`
- `upstream`: `https://github.com/NousResearch/hermes-agent.git`

End-user installs and in-app kernel updates must use `origin`, not `upstream`.
Upstream is only for maintainers to import official Hermes changes.

## Branches

- `main`: stable Jujing release branch. End users update from this branch.
- `sync/upstream-main`: optional integration branch for pulling official Hermes `main`.
- `release/jujing`: optional packaging branch for signed desktop builds.

## Update Policy

The desktop app updates the runtime kernel only. It must not rebuild or replace
the Jujing desktop shell from an upstream checkout.

Desktop shell updates are distributed as signed and notarized DMGs.

## Importing Official Hermes Updates

1. Fetch upstream:

   ```bash
   git fetch upstream --tags
   ```

2. Merge the official release tag or approved upstream commit into a Jujing
   integration branch.
3. Resolve conflicts while preserving Jujing branding, installer URLs, default
   persona, desktop app identity, and update policy.
4. Run verification:

   ```bash
   npm run test:desktop:platforms --workspace apps/desktop
   npm run typecheck --workspace apps/desktop
   npm run build --workspace apps/desktop
   npm run builder --workspace apps/desktop -- --mac dmg --publish never
   npm run dist:win:nsis --workspace apps/desktop
   ```

5. Tag the verified release, for example:

   ```bash
   git tag jujing-v0.19.0-1
   ```

6. Publish the tag and signed desktop artifacts.

## Required Before Public Distribution

- Keep `github.com/cxhihilwb123-hash/jujing-agent` available to released
  clients.
- Keep a push-capable maintainer credential locally or install the GitHub App on
  this repository for release automation.
- Configure Apple Developer ID signing and notarization for macOS DMGs.
- Configure a Windows code-signing certificate for Windows installers.
