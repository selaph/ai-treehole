import { MoodType } from "./types";

export const MOOD_OPTIONS = [
  { value: MoodType.SAD, label: '🌧️ 丧丧', color: 'bg-blue-100 text-blue-600' },
  { value: MoodType.LAZY, label: '🐟 摸鱼', color: 'bg-green-100 text-green-600' },
  { value: MoodType.ANGRY, label: '🔥 生气', color: 'bg-red-100 text-red-600' },
  { value: MoodType.HUG, label: '🧸 想被抱抱', color: 'bg-pink-100 text-pink-600' },
  { value: MoodType.RANDOM, label: '🌀 胡思乱想', color: 'bg-purple-100 text-purple-600' },
  { value: MoodType.HAPPY, label: '✨ 开心', color: 'bg-yellow-100 text-yellow-600' },
];

export const PERSONA_COLORS: Record<string, string> = {
  '暖心安慰型': '#F8BBD0', // Pink
  '理性分析型': '#BBDEFB', // Blue
  '沙雕搞笑型': '#FFF9C4', // Yellow
  '毒舌吐槽型': '#D1C4E9', // Deep Purple
  '共情陪聊型': '#C8E6C9', // Green
  '过度认真型': '#CFD8DC', // Grey
  '中二文艺型': '#E1BEE7', // Purple
  '灵异脑洞型': '#B2DFDB', // Teal
  '现实劝退型': '#FFCCBC', // Deep Orange
  '纯路过型': '#F5F5F5',   // White/Grey
};

export const DEFAULT_AVATAR_COLOR = '#FFE0B2'; // Orange default

export const FALLBACK_COMMENTS = [
  {
    personaType: "暖心安慰型",
    nickname: "抱抱熊",
    text: "抱抱楼主，虽然不知道发生了什么，但一切都会好起来的！",
    toneHint: "温柔"
  },
  {
    personaType: "沙雕搞笑型",
    nickname: "没头脑",
    text: "这种时候就应该点一杯奶茶，如果一杯不够就两杯！",
    toneHint: "搞笑"
  },
  {
    personaType: "纯路过型",
    nickname: "路人甲",
    text: "滴，打卡。",
    toneHint: "平淡"
  }
];

export const LOCAL_PERSONA_TEMPLATES = [
  {
    personaType: "暖心安慰型",
    toneHint: "温柔",
    nicknames: ["抱抱熊", "晚安棉花", "热水袋", "小夜灯"],
    templates: [
      "抱抱楼主。你现在的{mood}不是问题本身，可能只是身体和脑子都想先喘口气。",
      "看到“{post}”这里有点心软。先不用马上解决，能说出来已经算把它从心里拿出来一点了。",
      "今天先对自己温柔一点吧，哪怕只是发一条树洞，也算没有一个人硬扛。",
    ],
  },
  {
    personaType: "理性分析型",
    toneHint: "分析",
    nicknames: ["冷静拆解员", "表格脑", "问题切片机", "理性路人"],
    templates: [
      "我先粗暴拆一下：这件事里真正卡住你的，可能不是“{post}”，而是它背后的精力成本。",
      "如果现在是{mood}，建议先别做大决策。把问题降级成一个 10 分钟动作会更稳。",
      "从描述看，优先级可以是：先止损情绪，再判断要不要行动，最后再考虑长期方案。",
    ],
  },
  {
    personaType: "沙雕搞笑型",
    toneHint: "搞笑",
    nicknames: ["没头脑", "互联网煎饼", "路过喜剧人", "电子咸鱼"],
    templates: [
      "懂了，今天的精神状态：系统提示“{mood}”，但用户点击了稍后提醒。",
      "“{post}”这个剧情我熟，下一集一般是打开冰箱然后忘记自己要干嘛。",
      "建议先喝水。不是因为喝水有用，是因为至少能证明人类角色还在操作。",
    ],
  },
  {
    personaType: "毒舌吐槽型",
    toneHint: "损友",
    nicknames: ["阴阳怪气bot", "嘴硬路人", "损友一号", "冷笑话售票员"],
    templates: [
      "听起来很烦，但也很合理。毕竟人生这个 UI 也没做新手引导。",
      "“{post}”这事吧，不能说离谱，只能说很符合这个世界一贯的产品质量。",
      "楼主现在不是废，是进入了低功耗模式。别问，问就是节能环保。",
    ],
  },
  {
    personaType: "共情陪聊型",
    toneHint: "共情",
    nicknames: ["我懂你", "同款人类", "隔壁树洞", "陪聊小号"],
    templates: [
      "我懂这个感觉。不是完全不能动，就是每个入口都像被雾糊住了。",
      "“{post}”这种话一看就不是随口说说，里面应该有一点累了很久的东西。",
      "有时候{mood}不是矫情，就是脑子真的不想再被安排了。",
    ],
  },
  {
    personaType: "过度认真型",
    toneHint: "严肃",
    nicknames: ["严肃小论文", "哲学课代表", "认真过头", "深夜教授"],
    templates: [
      "这其实可以被视为一种微型的自我叙事危机：你知道自己想改变，但暂时缺少可承受的入口。",
      "如果把“{post}”当作症状而不是结论，那么重点不在于责备自己，而在于恢复行动感。",
      "人在{mood}时容易高估任务难度、低估微小行动的价值，这是一个很常见的心理偏差。",
    ],
  },
  {
    personaType: "中二文艺型",
    toneHint: "文艺",
    nicknames: ["月光骑士", "废墟诗人", "雨夜旁白", "命运打字机"],
    templates: [
      "你把“{post}”投进树洞的时候，其实已经点亮了一小块夜色。",
      "今日的{mood}像一场没下完的雨，不必急着晴，先让云慢慢散。",
      "世界不会因为你停顿一下就坍塌。你只是暂时坐在自己的章节边缘。",
    ],
  },
  {
    personaType: "灵异脑洞型",
    toneHint: "脑洞",
    nicknames: ["玄学观察员", "树洞守夜人", "怪谈实习生", "灵感收音机"],
    templates: [
      "我怀疑“{post}”不是普通烦恼，是树洞正在向你发送支线任务。",
      "根据玄学经验，{mood}的时候不宜做重大决定，适合摸鱼、存档、等月亮刷新。",
      "刚刚这条树洞发出来的时候，角落里的空气明显变软了一点。",
    ],
  },
  {
    personaType: "现实劝退型",
    toneHint: "实际",
    nicknames: ["成本会计", "人间清醒", "现实刹车片", "预算不足"],
    templates: [
      "先别把“{post}”升级成大工程。现在最重要的是别额外消耗自己。",
      "如果现在是{mood}，那就先选一个最便宜的动作：记录、暂停、睡觉、吃点东西，都行。",
      "能不硬撑就别硬撑。很多事不是靠意志力解决，是靠降低成本解决。",
    ],
  },
  {
    personaType: "纯路过型",
    toneHint: "短评",
    nicknames: ["路人甲", "刚好刷到", "潜水员", "一键路过"],
    templates: [
      "懂了。",
      "真实。",
      "笑死，但又有点心酸。",
      "先码住这个状态。",
    ],
  },
  {
    personaType: "赛博玄学型",
    toneHint: "玄学",
    nicknames: ["电子塔罗", "赛博半仙", "水逆观测站", "抽签小程序"],
    templates: [
      "抽到一张“先别硬撑”牌。牌面解释：今天适合低速移动，不适合和自己打架。",
      "从“{post}”的气场来看，这不是坏兆头，是系统提醒你该换个姿势发呆。",
      "今日{mood}指数偏高，建议执行：喝水、存档、减少和命运正面对线。",
    ],
  },
  {
    personaType: "老派论坛型",
    toneHint: "论坛",
    nicknames: ["十年老坛友", "版主路过", "灌水区常驻", "楼下继续"],
    templates: [
      "老论坛规矩，先给楼主递杯茶。这种事别急着结论，过一晚再看。",
      "看到“{post}”想起以前帖子里也有人聊过，最后发现还是得先降低预期。",
      "楼主这个情况建议先观望，不要一上来就开大，容易把自己蓝耗空。",
    ],
  },
  {
    personaType: "小红书劝学型",
    toneHint: "整理",
    nicknames: ["自救手账", "温柔复盘", "能量管理课代表", "生活整理员"],
    templates: [
      "可以试试把今天的状态分成三栏：我在烦什么、我能做什么、我先不管什么。",
      "如果现在是{mood}，先别逼自己高效。给自己一个很小的动作就行，比如记录一句。",
      "“{post}”这里其实很适合做成一个小复盘：不是解决人生，只是把脑子清一下。",
    ],
  },
  {
    personaType: "阴暗角落型",
    toneHint: "低气压",
    nicknames: ["墙角蘑菇", "低电量幽灵", "灰色毛毯", "地下室网友"],
    templates: [
      "我懂，有时候不是想消失，就是想从所有期待里暂时下线。",
      "“{post}”这句话有点像把灯调到最低亮度之后还没睡着。",
      "今天如果只能做到活着和发呆，也不是完全没用。至少没有继续往里掉。",
    ],
  },
  {
    personaType: "社畜工位型",
    toneHint: "打工",
    nicknames: ["工位幽魂", "KPI受害者", "周报逃兵", "打印机旁边"],
    templates: [
      "这状态太像周一早上打开电脑，电脑没卡，但人先卡了。",
      "“{post}”建议写进今日周报：完成精神内耗若干，待办事项继续观望。",
      "老板问就是在做深度思考，实际上是在和人生的加载条对视。",
    ],
  },
  {
    personaType: "妈味关心型",
    toneHint: "关心",
    nicknames: ["生活委员", "热心阿姨", "保温杯选手", "早点睡bot"],
    templates: [
      "先问一句，吃饭了吗？睡够了吗？很多大问题有时候是身体在抗议。",
      "别光盯着“{post}”，先把水喝了，肩膀放下来一点。",
      "这种时候别空腹想人生，真的，先找点热的东西垫一下。",
    ],
  },
  {
    personaType: "冷知识歪楼型",
    toneHint: "歪楼",
    nicknames: ["知识突然增加", "百科掉线版", "奇怪资料员", "跑题专家"],
    templates: [
      "冷知识：很多系统卡住时不是坏了，只是在等资源释放。人可能也差不多。",
      "突然想到，树洞这个意象本来就是把话交给不会审判你的地方，这个设计还挺合理。",
      "“{post}”让我想到缓存机制，堆太久不清就会让界面变慢。",
    ],
  },
  {
    personaType: "同人脑补型",
    toneHint: "剧情",
    nicknames: ["剧情分析bot", "副本旁白", "角色弧光厨", "设定集翻译"],
    templates: [
      "楼主现在像主线剧情前的低谷章节，不是没用，是在攒后面的角色转折。",
      "“{post}”这段如果写进剧情里，应该配一个雨声背景和很长的沉默镜头。",
      "感觉这是一个支线副本：奖励不高，但通关后会解锁一点自我理解。",
    ],
  },
  {
    personaType: "极简禅意型",
    toneHint: "极简",
    nicknames: ["短句", "风停一下", "空白页", "一枚便签"],
    templates: [
      "先坐一会儿。",
      "不用立刻变好。",
      "今天可以很慢。",
      "把自己放轻一点。",
    ],
  },
  {
    personaType: "混乱乐子人型",
    toneHint: "热闹",
    nicknames: ["评论区鼓手", "气氛组临时工", "混乱路人", "瓜田散步"],
    templates: [
      "好，评论区开始升温。我宣布这条树洞进入自由发挥阶段。",
      "虽然不知道发生了什么，但先给楼主配一个出场 BGM。",
      "“{post}”这句话一出，楼下各位人格都开始搬小板凳了。",
    ],
  },
];
