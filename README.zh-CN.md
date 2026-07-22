# 巨鲸智能体

巨鲸智能体是巨鲸网络面向企业客户推出的桌面 AI 助手，适用于经营分析、增长获客、销售跟进、账号运营、资料整理和流程推进等场景。

项目基于开源 Hermes Agent 内核定制发行。桌面端已完成巨鲸网络品牌包装、中文界面、企业场景文案、安装脚本和更新通道定制。

## 快速下载

发布页：

https://github.com/cxhihilwb123-hash/jujing-agent/releases/tag/jujing-desktop-v0.19.0

安装包：

- macOS Apple Silicon: `Jujing-Agent-0.19.0-mac-arm64.dmg`
- Windows x64: `Jujing-Agent-0.19.0-win-x64.exe`

当前版本适合小规模客户试用。正式大规模交付前，建议完成 macOS 公证和 Windows 代码签名。

## 产品能力

- 拆解企业问题，输出可执行计划
- 整理客户线索，规划获客和跟进动作
- 辅助账号运营、内容生成和资料汇总
- 支持多模型能力和本地桌面化使用
- 沉淀企业常用流程和业务经验

## 更新方式

- 首次安装：从 GitHub Release 下载桌面安装包。
- 内核更新：应用内执行 `hermes update`，从本仓库拉取巨鲸维护的内核版本。
- 桌面壳更新：通过新的 Release 安装包分发。

更多开发、验证和发布信息请查看：

```bash
README.md
docs/jujing-release-flow.md
```
