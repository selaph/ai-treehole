# AI 树洞项目状态

更新时间：2026-05-21

## 项目定位

这是一个本地单机的“伪社区树洞”玩具。

核心设定：

- 用户是唯一真人。
- 界面像社区/评论区。
- 用户发布树洞后，评论区由本地语料或用户自己配置的外部 AI API 生成。
- 默认不需要登录、不需要服务器、不收费、不上传到项目作者处。
- 内容默认只保存在当前浏览器本地。

这个项目不是变现项目，优先按“自用、好玩、低压力完善”的方向继续。

## 当前完成度

### 已完成

- 从 Google AI Studio 导出代码并搬到本地。
- 项目可本地运行，技术栈是 Vite + React + TypeScript。
- 已安装依赖，安装时使用过：

```bash
npm install --ignore-scripts
```

- `npm run build` 已通过。
- 默认改为“本地语料模式”，不开 API 也能生成评论。
- 支持三种生成模式：
  - 本地语料
  - 通用 API
  - Gemini
- 通用 API 使用 OpenAI-compatible `/chat/completions`，可接：
  - OpenAI
  - OpenRouter
  - DeepSeek
  - LM Studio
  - Ollama
  - 其他兼容 OpenAI Chat Completions 的服务
- Gemini 直连模式仍保留。
- API 设置在界面左侧“本地与 API 设置”里填写，不再依赖 `.env.local`。
- 帖子、评论、设置存入 `localStorage`。
- 修复了刷新页面后历史记录被空数组覆盖的问题。
- 历史记录支持：
  - 单条删除
  - 清空全部
  - 导出 JSON
  - 导入 JSON，追加到当前记录，不覆盖已有记录
- 点赞已改为单用户开关：点一次点赞，再点取消，UI 会显示已赞状态，计数不会无限叠加。
- 支持自定义树洞名称，名称保存在本地设置里，并显示在顶部标题和发帖提示里。
- 支持界面风格切换，当前内置 4 个柔和 pastel 主题：
  - 棉花糖粉
  - 奶油薄荷
  - 蓝莓雾
  - 桃杏手帐
- 滚动条颜色会跟随当前主题；奶油薄荷和蓝莓雾已调低亮度与饱和度，减少冷色主题的刺眼感。
- 本地语料人格从原来的 10 类扩展到 20 类。
- API 提示词已放开，允许模型自由创造新的人格、昵称和口吻，不再死守固定 10 类。
- UI 做过一次设置区调整：
  - “本地语料 / 通用 API / Gemini”保持一行三列。
  - 输入框继续显示在下方。
  - 左侧栏在桌面端略加宽。
  - 左侧区域允许滚动，避免设置展开后内容被挤没。
- 清理了 AI Studio 导出时残留的 `/index.css` 引用警告。
- README 已改成面向普通用户的使用说明，优先讲“在线版怎么用、下载版怎么打开、为什么建议联网、数据保存在哪里”，避免堆技术术语。
- `PUBLISHING.md` 增加了可直接复制到发布页/下载页的普通用户说明。

## 当前收口状态

2026-05-21 这一轮先收口，不继续硬加功能。当前版本已经适合作为轻量自用/试玩版继续准备发布：

- 完整体验更偏向联网 API 模式，本地语料主要是兜底和演示。
- 建议发布说明写清楚“推荐联网使用”，否则外部 AI API 不能回复，页面字体或样式也可能加载不完整。
- 下载版不必现在做单 HTML；只要把构建后的 `dist/` 整个文件夹压缩给用户，解压后打开 `index.html` 即可。不要只单独分发 `index.html`。
- 发布暂缓，等用户晚点在当前对话或新对话里再继续。
- 2026-05-21 晚上试发布进展：
  - 新增 `package:local` 脚本，可一键构建并生成 `releases/ai-treehole-local-dist.zip`。
  - 已生成干净的本地下载包，zip 内只包含 `dist/`、`dist/index.html` 和 `dist/assets/...`。
  - 新增 `.github/workflows/deploy-pages.yml`，后续推到 GitHub 后可用 GitHub Actions 部署 Pages。
  - 当前项目目录还不是 git 仓库；真正上线还需要初始化/连接 GitHub 仓库，并在 GitHub Pages 设置里选择 GitHub Actions。

## 当前运行方式

项目目录：

```bash
/Users/selaph/project/ai-treehole-·-persona-simulator
```

启动：

```bash
npm run dev -- --host 127.0.0.1
```

默认地址：

```txt
http://127.0.0.1:3000/
```

构建检查：

```bash
npm run build
```

## 关键文件

```txt
App.tsx
```

主界面、状态管理、localStorage、设置区、历史列表、导入导出。

```txt
services/geminiService.ts
```

评论生成逻辑。虽然文件名还叫 `geminiService`，但现在里面已经包含：

- 本地语料生成
- OpenAI-compatible 通用 API 生成
- Gemini API 生成

以后可以考虑重命名为 `aiService.ts`。

```txt
constants.ts
```

心情选项、人格颜色、本地人格语料模板。

```txt
README.md
```

面向使用者的本地运行和隐私说明。

```txt
PROJECT_STATUS.md
```

当前这份项目交接记录。

## 安全与隐私现状

默认本地语料模式：

- 不调用外部 API。
- 内容只存在当前浏览器的 `localStorage`。
- 换浏览器、换地址、清理网站数据、无痕模式关闭后，记录可能不可见或被清掉。

启用外部 API 后：

- 树洞内容会发送给用户自己配置的 API 服务商。
- API Key 保存在当前浏览器的 `localStorage`。
- 当前实现适合本机自用，不适合直接作为公开网站托管，因为浏览器端保存和调用 API Key 有暴露风险。

npm 安装安全处理：

- 已用 `npm install --ignore-scripts` 安装依赖，避免依赖包安装阶段自动执行脚本。
- `npm audit` 结果是 0 个已知漏洞。
- `npm audit signatures` 因为本机无法解析 `tuf-repo-cdn.sigstore.dev` 没完成；这不影响项目运行，只是少了一层包签名验证。

## 已知问题

- 界面仍依赖 Tailwind CDN 和 Google Fonts，因此不是完全离线样式。
- `services/geminiService.ts` 文件名已经不准确，里面不只 Gemini。
- 通用 API 只实现了 OpenAI-compatible `/chat/completions`，没有单独适配非兼容格式。
- API Key 存在浏览器 `localStorage`，只适合本机玩具，不适合公开部署。
- 历史记录仍依赖浏览器本地存储；如果想更稳，需要本地文件存储、IndexedDB 或桌面壳。
- 没有自动测试。
- 右侧评论区和左侧面板的视觉还保留 AI Studio 原型感，后续可继续打磨。
- bundle 有 500KB 以上提示，当前不影响使用。

## 后续可改方向

### 发布前轻量完善方向（当前优先）

用户当前倾向：

- 不做后端。
- 不做登录、账号、云同步或管理后台。
- 保持纯本地使用：用户下载后在自己电脑上使用，数据留在自己的浏览器/本机。
- 线上版只作为“方便访问”的静态网页，不承担社区、账号或云端保存功能。
- 如果后续有趣或有精力再更新；如果没有，完善到一个轻量可发布状态即可。

短期适合做的功能：

- 导出/导入增强：
  - 当前已经支持历史记录导出/导入。
  - 后续可以增加“设置导出/导入”，包含树洞名称、主题风格、自定义 AI 网友等。
  - API Key 是否导出要谨慎，默认不导出更安全；如支持导出，应明确提示风险。
- 自定义 AI 网友：
  - 可以先做轻量版，不做复杂人格编辑器。
  - 字段可以包括：网友类型、语气描述、常说的话、不喜欢的说法。
  - 这些自定义网友混入本地语料/API prompt 中即可。
- 发布准备：
  - 保持 `dist/` 静态发布版本。
  - 本地下载版可以先提供 `dist.zip`，用户解压后打开 `index.html`。
  - 推荐下一步补 GitHub Pages 自动部署流程和一个稳定打包 zip 的脚本，避免以后每次发布都手动重做。
  - 后续如有精力，再做真正单 HTML 文件和完全离线样式；这不是当前上线门槛。

UI 与素材方向：

- 当前界面简单清爽，可以保留，不需要为了发布前强行大改。
- 用户喜欢好看的界面，但这属于个人偏好加分项，不是当前刚需。
- 后续如果用户把以前的 UI 素材搬到这台电脑，可以再讨论如何应用到 AI 树洞、AI 文游或其他本地 App 小工具中。
- 可选素材来源：
  - 使用用户已有 UI 素材。
  - 购买或下载免费可商用素材。
  - 继续用 AI 生成图标、背景、装饰元素。
- 做 UI 时保持轻量，不要让树洞功能变复杂。

### 低优先级但实用

- 把 `services/geminiService.ts` 重命名为 `services/aiService.ts`。
- 做一个“导出 Markdown”按钮，把树洞和评论导成日记式文本。
- 增加搜索历史记录功能。
- 增加按心情筛选历史记录。
- 增加“置顶 / 收藏某条回复”。
- 增加“复制整条树洞”。

### 更像单机应用

- 把 Tailwind 和字体本地化，减少外部 CDN。
- 用 IndexedDB 替代 `localStorage`，更适合保存大量历史。
- 做 Electron / Tauri 桌面版。
- 支持本地 JSON 文件存储。

### 更好玩的树洞功能

- 允许用户自定义人格库。
- 每次“召唤更多网友”时降低重复度。
- 给每个 AI 网友做固定头像、签名、发言习惯。
- 做“评论区热度”：点赞、楼中楼、路人吵起来。
- 增加“今天的树洞总结”。
- 增加“把今天的树洞导出到 Codex 日记”。
- 增加“只安慰 / 只吐槽 / 只发疯 / 只分析”的回复模式。

### API 相关

- 支持更多 OpenAI-compatible 参数设置：
  - temperature
  - max_tokens
  - top_p
- 支持测试 API 连接按钮。
- 支持保存多个 API 配置。
- 支持本地模型预设：
  - LM Studio
  - Ollama
  - OpenRouter
  - DeepSeek

## 下一次接手建议

如果用户说“继续改 AI 树洞”，先读：

```txt
/Users/selaph/project/ai-treehole-·-persona-simulator/PROJECT_STATUS.md
```

然后视任务读：

```txt
App.tsx
constants.ts
services/geminiService.ts
README.md
```

如果只是改 UI，优先看 `App.tsx` 和截图。

如果是改人格、语料、网友类型，优先看 `constants.ts` 和 `services/geminiService.ts`。

如果是改 API 接入，优先看 `services/geminiService.ts`。

如果是改历史记录、导入导出、清理逻辑，优先看 `App.tsx`。
