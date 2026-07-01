# 巨鲸智能体

巨鲸智能体是巨鲸网络面向企业经营、增长、销售、运营和管理场景打造的桌面 AI 助手。

它基于开源 Hermes Agent 内核进行品牌化发行，桌面端已完成巨鲸网络标识、中文界面、企业场景文案、安装脚本和内核更新通道的定制。用户安装后打开的就是巨鲸智能体，不需要额外安装上游 Hermes 桌面端。

## 产品定位

- 企业问题拆解与行动计划生成
- 客户线索整理、获客动作规划与跟进辅助
- 账号运营、内容生成、资料汇总和流程推进
- 多模型接入、本地运行环境和桌面化使用体验

## 桌面端

桌面应用名称：`巨鲸智能体`

macOS 构建产物：

```bash
apps/desktop/release/巨鲸智能体-0.17.0-mac-arm64.dmg
```

Windows x64 构建产物：

```bash
apps/desktop/release/巨鲸智能体-0.17.0-win-x64.exe
```

当前桌面壳已经完成白标包装，包括：

- 应用名称、窗口标题、菜单和关于信息
- 图标、启动界面和主界面品牌标识
- 默认中文界面和企业场景欢迎文案
- 安装脚本和更新源

## 更新策略

本仓库是巨鲸智能体的发布源。

- `origin`：`https://github.com/cxhihilwb123-hash/jujing-agent.git`
- `upstream`：`https://github.com/NousResearch/hermes-agent.git`

用户端更新只更新运行内核，不会自动覆盖巨鲸桌面壳。上游 Hermes 的更新应先同步到本仓库，经过巨鲸包装检查和测试后，再发布给用户。

详细流程见：

```bash
docs/jujing-release-flow.md
```

## 开发与验证

常用验证命令：

```bash
npm run typecheck --workspace apps/desktop
npm run test:desktop:platforms --workspace apps/desktop
npm run build --workspace apps/desktop
npm run builder --workspace apps/desktop -- --mac dmg --publish never
npm run dist:win:nsis --workspace apps/desktop
```

## 发布注意事项

内部测试可以直接使用本地构建的 DMG。

正式对外分发前，建议完成：

- Apple Developer ID 签名
- macOS notarization
- Windows 代码签名证书
- 正式版本号和发布标签
- 发布包下载页或 GitHub Release

## 开源说明

本项目基于 Hermes Agent 开源项目进行定制发行。保留上游开源许可文件，并在巨鲸网络品牌包装下维护独立发布通道。
