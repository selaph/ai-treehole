# AI 树洞

一个给自己吐槽、碎碎念、找 AI 网友陪聊的小树洞。

你写一条树洞，它会像评论区一样生成一群不同性格的网友回复你。可以纯本地随便玩，也可以填自己的 AI API Key，让回复更灵活。

## 怎么用

### 在线版

打开下面这个链接就能用。第一次打开时可以先直接发一条试试。

https://selaph.github.io/ai-treehole/

### 下载版

1. 下载 [`ai-treehole-local-dist.zip`](https://github.com/selaph/ai-treehole/raw/main/releases/ai-treehole-local-dist.zip)。
2. 解压。
3. 打开解压出来的 `dist/index.html`。

解压后不要挪动里面的文件。`index.html` 和旁边的 `assets` 文件夹要留在一起，直接打开 `dist/index.html` 就好。

## 推荐联网使用

这个小工具打开就能试，但更推荐联网使用。

如果没联网：

- 外部 AI API 不能回复。
- 页面字体或样式可能加载不完整。
- 本地语料模式还能用，不过表达会比较有限，回复也会更死板。

## 本地语料和 API

点左侧「本地与 API 设置」，可以切换：

- 本地语料：不用 Key，随便试。
- 通用 API：适合 OpenAI、OpenRouter、DeepSeek、LM Studio、Ollama 等。
- Gemini：适合填写自己的 Gemini API Key。

本地语料比较适合快速体验。想要回复更自然，推荐切到 API 模式，填写你自己的 API Key。作者不会提供公共 Key。

## 可以自己改的小设置

在「本地与 API 设置」里还可以改：

- 树洞名称
- 界面风格
- API 地址、Key、模型名

界面风格目前有：

- 棉花糖粉
- 奶油薄荷
- 蓝莓雾
- 桃杏手帐

## 数据保存在哪里

树洞内容、评论和设置会保存在你当前浏览器里。

注意：

- 换浏览器可能看不到之前的内容。
- 清理浏览器的网站数据、本地存储、Cookie 等数据时，树洞内容、评论和设置也可能一起被删除。下载版也是这样。
- 如果想保留内容，清理浏览器数据之前可以先用页面里的导出功能备份，之后再导入回来。
- 用外部 AI API 时，你写的树洞会发送给你自己选择的 API 服务商。
