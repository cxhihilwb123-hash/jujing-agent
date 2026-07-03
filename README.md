# 巨鲸智能体

巨鲸智能体是巨鲸网络面向企业经营、增长、销售、运营和管理场景打造的桌面 AI 助手。

它基于开源 Hermes Agent 内核定制发行，提供可安装的 macOS 和 Windows 桌面客户端。用户安装后打开的是巨鲸智能体，不需要额外安装上游 Hermes 桌面端。

## 下载

当前桌面版发布页：

https://github.com/cxhihilwb123-hash/jujing-agent/releases/tag/jujing-desktop-v0.17.0

安装包：

- macOS Apple Silicon: `Jujing-Agent-0.17.0-mac-arm64.dmg`
- Windows x64: `Jujing-Agent-0.17.0-win-x64.exe`
- 校验文件: `SHA256SUMS.txt`

当前版本适合小规模客户试用和内部交付。正式大规模商业分发前，建议完成 macOS 公证和 Windows 代码签名。

## 能做什么

巨鲸智能体面向企业日常业务场景，而不是单一开发工具。它可以辅助团队：

- 拆解经营问题，形成行动计划和执行清单
- 整理客户线索，规划获客动作和跟进策略
- 辅助账号运营、内容生成、资料汇总和流程推进
- 连接多模型能力，在桌面环境中完成连续任务
- 沉淀企业常用流程、话术、资料和业务经验

## 桌面端品牌

桌面端已完成巨鲸网络白标包装：

- 应用名称：`巨鲸智能体`
- 应用标识、窗口标题、菜单、关于信息已替换
- 默认中文界面和企业场景欢迎文案
- macOS bundle id：`com.jujing.network.agent`
- 协议名：`jujing-agent`
- 默认数据目录与上游 Hermes CLI 隔离

默认数据目录：

- macOS/Linux: `~/.jujing-agent`
- Windows: `%LOCALAPPDATA%\jujing-agent`

这意味着同一台机器上已经安装上游 Hermes CLI 时，仍可以同时安装巨鲸智能体桌面版。

## 更新策略

本仓库是巨鲸智能体的公开发布源。

- 用户首次安装：从 GitHub Releases 下载桌面安装包。
- 用户点击更新内核：通过 `hermes update` 从本仓库拉取已经验证过的巨鲸内核版本。
- 桌面壳更新：通过新的 Release 安装包分发，不由内核更新自动覆盖。

上游 Hermes Agent 的更新不会直接推送给用户。维护者应先把上游变更同步到本仓库，保留巨鲸品牌、中文文案、桌面壳和更新策略，验证通过后再发布。

详细流程见：

```bash
docs/jujing-release-flow.md
```

## 开发与验证

常用验证命令：

```bash
npm run typecheck --workspace apps/desktop
npm run test:desktop:platforms --workspace apps/desktop
uv run --with pytest pytest tests/test_hermes_constants.py
npm run build --workspace apps/desktop
npm run dist:mac:dmg --workspace apps/desktop
npm run dist:win:nsis --workspace apps/desktop
```

## 当前交付状态

已完成：

- macOS Apple Silicon 安装包
- Windows x64 安装包
- GitHub Release 下载页
- 巨鲸品牌包装
- 中文界面与企业场景文案
- 与上游 Hermes CLI 的本地数据隔离
- 内核更新指向本仓库

仍建议补齐：

- Apple Developer ID 签名与 notarization
- Windows 代码签名证书
- GitHub Actions 自动构建与发布流程
- 受保护的稳定发布分支
- Windows 真机完整安装验收

## 开源说明

本项目基于 Hermes Agent 开源项目定制发行，保留上游开源许可，并在巨鲸网络品牌包装下维护独立发布通道。
