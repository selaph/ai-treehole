# AI 树洞发布说明

## 给普通用户看的说明

可以直接放在发布页或下载页：

```txt
AI 树洞是一个给自己吐槽、碎碎念、找 AI 网友陪聊的小工具。

在线版：打开网页链接就能用。

下载版：下载 zip，解压后打开 index.html。不要只拿出 index.html，旁边的 assets 文件夹也要留着。

推荐联网使用。联网后可以使用你自己的 AI API Key；如果没联网，外部 AI 回复不能用，页面字体或样式也可能不完整。

你的树洞内容和设置默认保存在当前浏览器里。换浏览器或清理浏览器数据后，之前的记录可能会消失。

如果你填写外部 AI API Key，你写的树洞会发送给你自己选择的 API 服务商。作者不会提供公共 Key，也不会替你保存内容。
```

这个项目适合同时提供两个版本：

1. 线上静态网页版：部署到 GitHub Pages、Cloudflare Pages、Netlify、Vercel 等静态托管平台。
2. 本地下载版：把构建后的 `dist/` 文件夹打成 zip，用户下载后打开 `index.html` 使用。

当前项目没有登录系统、没有后端数据库，也不会把树洞内容上传到项目作者的服务器。默认“本地语料模式”只使用浏览器本地存储；如果用户启用外部 API，内容会发送给用户自己配置的 API 服务商。

## 当前技术结构

```txt
App.tsx                    主界面、历史记录、设置区
constants.ts               本地人格和语料
services/geminiService.ts  本地语料 / 通用 API / Gemini 生成逻辑
dist/                      构建后的发布文件
```

项目是 Vite + React + TypeScript，不是手写单 HTML 源码。开发时用本地服务器，发布时用 `dist/`。

## 开发运行

```bash
npm install --ignore-scripts
npm run dev -- --host 127.0.0.1
```

打开终端显示的本地地址。

## 构建线上版

```bash
npm run build
```

把生成的 `dist/` 部署到静态托管平台即可。

适合的平台：

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

注意：如果托管在 GitHub Pages 的子路径下，当前配置已使用相对资源路径 `base: './'`，更适合子路径和本地打开。

## 构建本地下载版

```bash
npm run package:local
```

这个命令会先构建 `dist/`，再生成下载包：

```txt
releases/ai-treehole-local-dist.zip
```

用户解压后打开：

```txt
dist/index.html
```

当前本地版仍不是“真正单文件”，而是一个 `index.html` 加 `assets/` 文件夹的静态网页包。只要用户不要把 `index.html` 单独拿出来，解压后双击一般就可以打开。

## 隐私边界

默认本地语料模式：

- 不需要 API Key。
- 不调用外部 AI 服务。
- 树洞和评论保存在当前浏览器的 `localStorage`。

启用通用 API 或 Gemini：

- 用户填写自己的 Base URL、API Key 和模型名。
- 树洞内容会发送给用户配置的 API 服务商。
- API Key 保存在用户浏览器的 `localStorage`。

不建议把作者自己的 API Key 写进前端代码或 `.env.local` 后公开部署，因为前端 Key 可以被别人看到和滥用。

## 当前发布前注意点

- 页面仍使用 Tailwind CDN 和 Google Fonts，所以不是完全离线。默认本地语料隐私不受影响，但页面加载时可能请求这些前端资源。
- 如果想做更强隐私的本地包，下一步应该把 Tailwind 样式和字体本地化。
- 如果想做真正的单 HTML 文件，可以再加单文件打包步骤，把 JS/CSS 内联进一个 HTML。
- 线上版不做登录和后端时，每个用户的数据只保存在自己的浏览器里，换设备不会同步。

## 推荐发布节奏

1. 先用 `npm run package:local` 生成下载包，确认本地版可用。
2. 再把源码推到 GitHub 仓库。
3. GitHub Pages 可使用 `.github/workflows/deploy-pages.yml` 自动部署：每次 push 到 `main` 后自动构建并发布 `dist/`。
4. 后续如果用户反馈“本地打开失败”或“想完全离线”，再做真正单 HTML 和本地化样式版本。

## 当前试发布状态

- 已有本地下载包：`releases/ai-treehole-local-dist.zip`
- 已有 GitHub Pages 自动部署 workflow：`.github/workflows/deploy-pages.yml`
- 当前目录还不是 git 仓库，真正上线到 GitHub Pages 前还需要：
  - 初始化/连接 Git 仓库。
  - 推送到 GitHub。
  - 在 GitHub 仓库设置里启用 Pages，来源选择 GitHub Actions。
