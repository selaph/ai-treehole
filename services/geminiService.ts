import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCommentData, Comment } from "../types";
import { LOCAL_PERSONA_TEMPLATES } from "../constants";

export interface AiRuntimeSettings {
  provider: "local" | "openai-compatible" | "gemini";
  appName?: string;
  themeId?: string;
  apiKey?: string;
  model?: string;
  openaiModel?: string;
  geminiModel?: string;
  baseUrl?: string;
}

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
export const DEFAULT_OPENAI_COMPATIBLE_MODEL = "gpt-5-mini";
export const DEFAULT_OPENAI_COMPATIBLE_BASE_URL = "https://api.openai.com/v1";

const getGeminiClient = (settings?: AiRuntimeSettings) => {
  if (!settings || settings.provider !== "gemini") return null;

  const apiKey = settings.apiKey?.trim();
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const getPostHint = (postContent: string) => {
  const normalized = postContent.replace(/\s+/g, " ").trim();
  if (!normalized) return "这件事";
  return normalized.length > 36 ? `${normalized.slice(0, 36)}...` : normalized;
};

const generateLocalComments = (
  postContent: string,
  mood: string
): GeneratedCommentData[] => {
  const postHint = getPostHint(postContent);
  const count = 8 + Math.floor(Math.random() * 4);
  const shuffled = [...LOCAL_PERSONA_TEMPLATES].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, index) => {
    const persona = shuffled[index % shuffled.length];
    const template = pick(persona.templates);
    return {
      personaType: persona.personaType,
      nickname: pick(persona.nicknames),
      toneHint: persona.toneHint,
      text: template
        .replaceAll("{post}", postHint)
        .replaceAll("{mood}", mood),
    };
  });
};

const extractJsonPayload = (text: string) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() || trimmed;
};

const normalizeGeneratedComments = (value: unknown): GeneratedCommentData[] => {
  const rawItems = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { comments?: unknown }).comments)
      ? (value as { comments: unknown[] }).comments
      : [];

  return rawItems
    .filter((item): item is Partial<GeneratedCommentData> => item !== null && typeof item === "object")
    .map(item => ({
      personaType: String(item.personaType || "纯路过型"),
      nickname: String(item.nickname || "路人"),
      toneHint: String(item.toneHint || "短评"),
      text: String(item.text || "我看到了。"),
    }))
    .filter(item => item.text.trim());
};

const buildCommentsPrompt = (postContent: string, mood: string) => `
你现在是“评论区编剧”，要模拟一群风格各异的网友在同一条树洞下留言。

【帖子内容】：${postContent}
【帖子心情】：${mood}

请生成 8 到 12 条评论，模拟真实的社交网络评论区。

请从以下人格中随机选择并混合使用：
1. 暖心安慰型：温柔、鼓励、拥抱感。
2. 理性分析型：帮忙分析问题、给建议。
3. 沙雕搞笑型：用梗、玩笑、轻松化解尴尬。
4. 毒舌吐槽型：嘴臭但不恶意，阴阳怪气、损友感。
5. 共情陪聊型：真诚说“我懂你”、讲类似经历。
6. 过度认真型：把小事当哲学题，写一大段严肃分析。
7. 中二文艺型：用比喻、诗句或中二台词。
8. 灵异脑洞型：往怪力乱神方向歪楼，但不要吓人。
9. 现实劝退型：很实际，直接谈钱、精力、成本。
10. 纯路过型：一句话短评，像“哈哈哈哈笑死”“懂了”。
11. 赛博玄学型：像在抽签、占卜、看星象，但保持轻松。
12. 老派论坛型：像十几年前论坛老用户，爱讲经验和规矩。
13. 小红书劝学型：温柔但很会做人生整理和自我照顾建议。
14. 阴暗角落型：丧丧的、低气压，但不攻击人。
15. 社畜工位型：一切都能联想到上班、KPI、工位和老板。
16. 妈味关心型：像热心亲戚或生活委员，提醒吃饭睡觉。
17. 冷知识歪楼型：突然讲一个似乎有关又不太有关的知识。
18. 同人脑补型：把楼主的烦恼脑补成剧情、角色弧光或副本。
19. 极简禅意型：话很短，像签文、便签或一句轻轻的提醒。
20. 混乱乐子人型：只负责把评论区气氛搅热，不恶意。

要求：
- text 内容要符合该人格设定，口语化，可以使用 emoji。
- nickname 要简短有趣，符合人设。
- 可以自由创造不在列表里的新人格、新昵称和新口吻，让评论区更像随机刷到的真实社区。
- 同一次返回里尽量避免重复 nickname 和 personaType。
- 不要解释。
- 只返回 JSON，格式为：
{
  "comments": [
    {
      "personaType": "暖心安慰型",
      "nickname": "昵称",
      "toneHint": "温柔",
      "text": "评论内容"
    }
  ]
}
`;

const generateOpenAICompatibleComments = async (
  postContent: string,
  mood: string,
  settings: AiRuntimeSettings
) => {
  const apiKey = settings.apiKey?.trim();
  const baseUrl = (settings.baseUrl?.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL).replace(/\/+$/, "");
  const model = settings.model?.trim() || DEFAULT_OPENAI_COMPATIBLE_MODEL;

  if (!apiKey && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
    return null;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "你是一个只输出 JSON 的中文评论区生成器。",
        },
        {
          role: "user",
          content: buildCommentsPrompt(postContent, mood),
        },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible API failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("Empty response from OpenAI-compatible API");
  }

  const parsed = JSON.parse(extractJsonPayload(text));
  const comments = normalizeGeneratedComments(parsed);
  return comments.length > 0 ? comments : null;
};

const generateOpenAICompatibleFollowup = async (
  comment: Comment,
  postContent: string,
  userReplyText: string,
  settings: AiRuntimeSettings
) => {
  const apiKey = settings.apiKey?.trim();
  const baseUrl = (settings.baseUrl?.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL).replace(/\/+$/, "");
  const model = settings.model?.trim() || DEFAULT_OPENAI_COMPATIBLE_MODEL;

  if (!apiKey && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
    return null;
  }

  const prompt = `
你现在是评论区的一个网友，正在回复楼主（用户）对你评论的回复。

【背景 - 帖子内容】：${postContent}
【你之前的评论】：${comment.text}
【你的设定】：
  - 昵称：${comment.nickname}
  - 人格类型：${comment.personaType}

【楼主刚刚回复你】：${userReplyText}

请以“${comment.nickname}”的身份，保持“${comment.personaType}”的语气风格，给楼主回一句话。

要求：
1. 长度简短（1-3句），口语化，像真实的网友互动。
2. 针对楼主的回复进行回应。
3. 不要输出 JSON，直接输出回复的纯文本内容。
`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "你正在扮演一个中文评论区网友。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible API failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : null;
};

const generateLocalFollowup = (comment: Comment, userReplyText: string) => {
  const shortReply = getPostHint(userReplyText);

  const repliesByPersona: Record<string, string[]> = {
    "暖心安慰型": [
      `嗯嗯，我听到啦。你能继续说出来就已经很不容易了。`,
      `先别急着把自己整理好，慢慢来就行。`,
    ],
    "理性分析型": [
      `那我感觉重点可能不是“对错”，而是这件事到底消耗了你多少。`,
      `如果按你刚刚说的“${shortReply}”看，先把最烦的部分拆出来会比较好。`,
    ],
    "沙雕搞笑型": [
      `懂了，这属于精神状态先坐下喝口水再说。`,
      `收到，已经把这句话加入今日互联网生存样本。`,
    ],
    "毒舌吐槽型": [
      `可以，楼主这个状态很有“我知道但我不想知道”的美感。`,
      `听起来不是你不行，是这事本身就挺会折磨人的。`,
    ],
    "共情陪聊型": [
      `我懂，你说的这个点其实很戳人。`,
      `这种时候真的会有一种“明明没什么大事但就是很累”的感觉。`,
    ],
    "过度认真型": [
      `这其实是一个典型的自我期待与现实能量错位问题，值得单独展开。`,
      `从现象上看，你并不是没有想法，而是执行入口暂时被情绪噪音堵住了。`,
    ],
    "中二文艺型": [
      `你刚才这句话像夜里一盏没关的灯，亮得不大，但还在。`,
      `命运的弹窗又出现了，但楼主仍然保留关闭按钮。`,
    ],
    "灵异脑洞型": [
      `我怀疑这不是懒，是你的灵魂正在后台更新。`,
      `这句话一发出来，树洞里的小灯泡亮了一下。`,
    ],
    "现实劝退型": [
      `先别把它升级成大项目，能少消耗一点是一点。`,
      `这个阶段最值钱的是保住精力，不是立刻产出什么。`,
    ],
    "纯路过型": [
      `懂。`,
      `笑死，但也有点真实。`,
    ],
  };

  return pick(repliesByPersona[comment.personaType] || [
    `我看到了，继续说也行，不说也行。`,
  ]);
};

export const generateCommentsForPost = async (
  postContent: string,
  mood: string,
  settings?: AiRuntimeSettings
): Promise<GeneratedCommentData[]> => {
  if (settings?.provider === "openai-compatible") {
    try {
      const generated = await generateOpenAICompatibleComments(postContent, mood, settings);
      if (generated) return generated;
    } catch (error) {
      console.error("OpenAI-compatible API Error:", error);
    }
  }

  const client = getGeminiClient(settings);

  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateLocalComments(postContent, mood);
  }

  const prompt = buildCommentsPrompt(postContent, mood);

  try {
    const response = await client.models.generateContent({
      model: settings?.model?.trim() || DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              personaType: { type: Type.STRING },
              nickname: { type: Type.STRING },
              toneHint: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ['personaType', 'nickname', 'toneHint', 'text'],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const data = normalizeGeneratedComments(JSON.parse(jsonText));
    return data.length > 0 ? data : generateLocalComments(postContent, mood);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateLocalComments(postContent, mood);
  }
};

export const generateFollowupReply = async (
  comment: Comment,
  postContent: string,
  userReplyText: string,
  settings?: AiRuntimeSettings
): Promise<string | null> => {
  if (settings?.provider === "openai-compatible") {
    try {
      const generated = await generateOpenAICompatibleFollowup(comment, postContent, userReplyText, settings);
      if (generated) return generated;
    } catch (error) {
      console.error("OpenAI-compatible Followup Error:", error);
    }
  }

  const client = getGeminiClient(settings);
  if (!client) return generateLocalFollowup(comment, userReplyText);

  const prompt = `
    你现在是评论区的一个网友，正在回复楼主（用户）对你评论的回复。

    【背景 - 帖子内容】：${postContent}
    【你之前的评论】：${comment.text}
    【你的设定】：
      - 昵称：${comment.nickname}
      - 人格类型：${comment.personaType}
    
    【楼主刚刚回复你】：${userReplyText}

    请以“${comment.nickname}”的身份，保持“${comment.personaType}”的语气风格，给楼主回一句话。
    
    要求：
    1. 长度简短（1-3句），口语化，像真实的网友互动。
    2. 针对楼主的回复进行回应。
    3. 不要输出 JSON，直接输出回复的纯文本内容。
  `;

  try {
    const response = await client.models.generateContent({
      model: settings?.model?.trim() || DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });
    return response.text?.trim() || null;
  } catch (error) {
    console.error("Gemini Followup Error:", error);
    return generateLocalFollowup(comment, userReplyText);
  }
};
