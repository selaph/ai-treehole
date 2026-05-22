import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Post, Comment, Reply, MoodType } from './types';
import { MOOD_OPTIONS, PERSONA_COLORS, DEFAULT_AVATAR_COLOR } from './constants';
import { generateCommentsForPost, generateFollowupReply, AiRuntimeSettings } from './services/geminiService';
import { Button } from './components/Button';
import { CommentCard } from './components/CommentCard';

const STORAGE_KEY = 'ai_treehole_posts';
const SETTINGS_KEY = 'ai_treehole_settings';
const DEFAULT_APP_NAME = 'AI 树洞';
const DEFAULT_THEME_ID = 'cotton-candy';

const THEME_PRESETS = [
  {
    id: 'cotton-candy',
    label: '棉花糖粉',
    description: '粉、奶白、轻雾紫',
    colors: {
      page: '#FFF5F8',
      surface: '#FFFCFD',
      surfaceSoft: '#FFF0F5',
      field: '#FFF8FA',
      line: '#F8DDE7',
      lineSoft: '#F9EDF2',
      text: '#5D5360',
      muted: '#9B8D99',
      accent: '#E99AB5',
      accentStrong: '#D87499',
      accentSoft: '#FCE7EF',
      secondary: '#A9B8E8',
      secondaryStrong: '#7F91D6',
      secondarySoft: '#EEF1FF',
      headerA: '#EEF4FF',
      headerB: '#F7EEFF',
      headerC: '#FFF0F5',
    },
  },
  {
    id: 'milk-mint',
    label: '奶油薄荷',
    description: '奶绿、杏粉、浅蓝',
    colors: {
      page: '#F4F8F4',
      surface: '#FEFCF8',
      surfaceSoft: '#EEF5F0',
      field: '#FAFCF8',
      line: '#DDECE1',
      lineSoft: '#ECF3EE',
      text: '#4E6158',
      muted: '#89988F',
      accent: '#A8D8C0',
      accentStrong: '#78AD94',
      accentSoft: '#EAF5EF',
      secondary: '#EABEC9',
      secondaryStrong: '#C9879A',
      secondarySoft: '#F8ECEF',
      headerA: '#ECF5EF',
      headerB: '#FBF0F3',
      headerC: '#F2F5EE',
    },
  },
  {
    id: 'blueberry-mist',
    label: '蓝莓雾',
    description: '雾蓝、淡紫、粉白',
    colors: {
      page: '#F5F4FB',
      surface: '#FEFCFF',
      surfaceSoft: '#F0EFF8',
      field: '#FAFAFE',
      line: '#E0E2F0',
      lineSoft: '#EEEFF7',
      text: '#52586B',
      muted: '#8E93A6',
      accent: '#B8C5E8',
      accentStrong: '#8798C8',
      accentSoft: '#ECEFF9',
      secondary: '#D7B8D6',
      secondaryStrong: '#A982AE',
      secondarySoft: '#F4ECF5',
      headerA: '#EEF1FA',
      headerB: '#F4EFF8',
      headerC: '#FDF2F5',
    },
  },
  {
    id: 'peach-journal',
    label: '桃杏手帐',
    description: '桃粉、奶杏、纸感',
    colors: {
      page: '#FFF7F0',
      surface: '#FFFDF9',
      surfaceSoft: '#FFF0E6',
      field: '#FFF9F3',
      line: '#F3DEC9',
      lineSoft: '#F8ECE0',
      text: '#64554C',
      muted: '#9D8D82',
      accent: '#F1AA9B',
      accentStrong: '#DC7F74',
      accentSoft: '#FCE7E2',
      secondary: '#C9CFA5',
      secondaryStrong: '#9DA86F',
      secondarySoft: '#F1F4E6',
      headerA: '#FFF0E7',
      headerB: '#FFF8D9',
      headerC: '#F2F8E8',
    },
  },
] as const;

type ThemePreset = typeof THEME_PRESETS[number];

const getThemeById = (themeId?: string): ThemePreset =>
  THEME_PRESETS.find(theme => theme.id === themeId) || THEME_PRESETS[0];

const getThemeVars = (theme: ThemePreset): React.CSSProperties => ({
  '--color-page': theme.colors.page,
  '--color-surface': theme.colors.surface,
  '--color-surface-soft': theme.colors.surfaceSoft,
  '--color-field': theme.colors.field,
  '--color-line': theme.colors.line,
  '--color-line-soft': theme.colors.lineSoft,
  '--color-text': theme.colors.text,
  '--color-muted': theme.colors.muted,
  '--color-accent': theme.colors.accent,
  '--color-accent-strong': theme.colors.accentStrong,
  '--color-accent-soft': theme.colors.accentSoft,
  '--color-secondary': theme.colors.secondary,
  '--color-secondary-strong': theme.colors.secondaryStrong,
  '--color-secondary-soft': theme.colors.secondarySoft,
  '--color-header-a': theme.colors.headerA,
  '--color-header-b': theme.colors.headerB,
  '--color-header-c': theme.colors.headerC,
} as React.CSSProperties);

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [aiSettings, setAiSettings] = useState<AiRuntimeSettings>({
    provider: 'local',
    appName: DEFAULT_APP_NAME,
    themeId: DEFAULT_THEME_ID,
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
  });
  
  // Create Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMood, setNewPostMood] = useState<string>(MoodType.RANDOM);
  const [isCreating, setIsCreating] = useState(false);

  // Detail View State
  const [isRefreshingComments, setIsRefreshingComments] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse posts", e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setAiSettings({
          provider: 'local',
          appName: DEFAULT_APP_NAME,
          themeId: DEFAULT_THEME_ID,
          apiKey: '',
          model: 'gpt-4o-mini',
          baseUrl: 'https://api.openai.com/v1',
          ...JSON.parse(savedSettings),
        });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    setHasLoadedStorage(true);
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [hasLoadedStorage, posts]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiSettings));
  }, [aiSettings, hasLoadedStorage]);

  // Derived state
  const selectedPost = posts.find(p => p.id === selectedPostId);
  const appName = aiSettings.appName?.trim() || DEFAULT_APP_NAME;
  const activeTheme = getThemeById(aiSettings.themeId);
  const themeVars = getThemeVars(activeTheme);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(getThemeVars(activeTheme)).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });
  }, [activeTheme]);

  // --- Handlers ---

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsCreating(true);
    const newPostId = uuidv4();
    const timestamp = new Date().toISOString();

    const newPost: Post = {
      id: newPostId,
      content: newPostContent,
      mood: newPostMood,
      createdAt: timestamp,
      comments: []
    };

    // Optimistically add post
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setSelectedPostId(newPostId);

    // Generate Initial Comments
    try {
      const generatedData = await generateCommentsForPost(newPost.content, newPost.mood, aiSettings);
      const newComments: Comment[] = generatedData.map(data => ({
        id: uuidv4(),
        personaType: data.personaType,
        nickname: data.nickname,
        avatarColor: PERSONA_COLORS[data.personaType] || DEFAULT_AVATAR_COLOR,
        text: data.text,
        likes: Math.floor(Math.random() * 50),
        likedByMe: false,
        replies: []
      }));

      setPosts(prev => prev.map(p => 
        p.id === newPostId ? { ...p, comments: newComments } : p
      ));
    } catch (error) {
      console.error("Failed to generate initial comments", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshComments = async () => {
    if (!selectedPost) return;
    setIsRefreshingComments(true);
    
    try {
      const generatedData = await generateCommentsForPost(selectedPost.content, selectedPost.mood, aiSettings);
      const newComments: Comment[] = generatedData.map(data => ({
        id: uuidv4(),
        personaType: data.personaType,
        nickname: data.nickname,
        avatarColor: PERSONA_COLORS[data.personaType] || DEFAULT_AVATAR_COLOR,
        text: data.text,
        likes: Math.floor(Math.random() * 20),
        likedByMe: false,
        replies: []
      }));

      setPosts(prev => prev.map(p => 
        p.id === selectedPost.id 
          ? { ...p, comments: [...p.comments, ...newComments] } 
          : p
      ));
    } finally {
      setIsRefreshingComments(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== selectedPostId) return p;
      return {
        ...p,
        comments: p.comments.map(c => 
          c.id === commentId
            ? {
                ...c,
                likedByMe: !c.likedByMe,
                likes: c.likedByMe ? Math.max(0, c.likes - 1) : c.likes + 1,
              }
            : c
        )
      };
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
  };

  const handleClearPosts = () => {
    if (!posts.length) return;
    const confirmed = window.confirm('确定要清空所有树洞记录吗？这个操作不能撤销。');
    if (!confirmed) return;
    setPosts([]);
    setSelectedPostId(null);
  };

  const handleExportPosts = () => {
    const payload = {
      app: appName,
      exportedAt: new Date().toISOString(),
      posts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-treehole-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPosts = async (file: File | null) => {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedPosts = Array.isArray(parsed) ? parsed : parsed.posts;

      if (!Array.isArray(importedPosts)) {
        throw new Error('Invalid treehole export');
      }

      const confirmed = window.confirm('要导入这些树洞记录吗？会追加到当前列表，不会覆盖现有记录。');
      if (!confirmed) return;

      setPosts(prev => {
        const existingIds = new Set(prev.map(post => post.id));
        const nextPosts = importedPosts.filter((post: Post) => post?.id && !existingIds.has(post.id));
        return [...nextPosts, ...prev];
      });
    } catch (error) {
      console.error('Failed to import posts', error);
      window.alert('导入失败：这个文件看起来不是 AI 树洞导出的 JSON。');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleReplyToComment = async (commentId: string, text: string) => {
    // 1. Prepare User Reply
    const newReply: Reply = {
      id: uuidv4(),
      author: '楼主',
      text: text,
      createdAt: new Date().toISOString()
    };

    // Capture context before async operations or state updates
    const currentPost = posts.find(p => p.id === selectedPostId);
    const targetComment = currentPost?.comments.find(c => c.id === commentId);

    // 2. Add User Reply to State
    setPosts(prev => prev.map(p => {
      if (p.id !== selectedPostId) return p;
      return {
        ...p,
        comments: p.comments.map(c => 
          c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
        )
      };
    }));

    // 3. 50% Chance for AI Follow-up
    // Must have post context and target comment to proceed
    if (currentPost && targetComment && Math.random() < 0.5) {
      try {
        const aiText = await generateFollowupReply(targetComment, currentPost.content, text, aiSettings);
        
        if (aiText) {
          const aiReply: Reply = {
            id: uuidv4(),
            author: targetComment.nickname, // AI replies with their nickname
            text: aiText,
            createdAt: new Date().toISOString()
          };

          // Append AI reply to state
          setPosts(prev => prev.map(p => {
            if (p.id !== selectedPostId) return p;
            return {
              ...p,
              comments: p.comments.map(c => 
                c.id === commentId ? { ...c, replies: [...c.replies, aiReply] } : c
              )
            };
          }));
        }
      } catch (error) {
        console.error("Failed to generate follow-up reply", error);
      }
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen pb-12 bg-[var(--color-page)] text-[var(--color-text)]" style={themeVars}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface)]/85 backdrop-blur-md border-b border-[var(--color-line)] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">🌳</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-accent-strong)] to-[var(--color-secondary-strong)] bg-clip-text text-transparent truncate">
              {appName}
            </h1>
          </div>
          <div className="shrink-0 text-xs font-semibold text-[var(--color-accent-strong)] px-3 py-1 bg-[var(--color-accent-soft)] rounded-full">
            {aiSettings.provider === 'openai-compatible'
              ? 'OpenAI 兼容模式'
              : aiSettings.provider === 'gemini'
              ? 'Gemini 模式'
              : '本地单机模式'}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Create Post & History List (Takes 4 cols on desktop) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 max-h-[calc(100vh-100px)] sticky top-24 overflow-y-auto pr-1">
          
          {/* Create Post Card */}
          <div className="bg-[var(--color-surface)] p-5 rounded-3xl shadow-lg border border-[var(--color-line-soft)] flex flex-col gap-4 flex-shrink-0">
            <h2 className="font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>📝</span> 丢个新树洞
            </h2>
            
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder={`今天想丢进「${appName}」的是什么？`}
              className="w-full h-32 p-3 bg-[var(--color-field)] rounded-xl border-2 border-transparent focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] transition-all outline-none resize-none text-[var(--color-text)] placeholder:text-[var(--color-muted)]/70"
            />
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">选择心情</label>
              <div className="grid grid-cols-3 gap-2">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setNewPostMood(mood.value)}
                    className={`text-xs py-2 px-1 rounded-lg border transition-all ${
                      newPostMood === mood.value 
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] font-bold shadow-sm' 
                        : 'border-[var(--color-line-soft)] text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCreatePost} 
              isLoading={isCreating} 
              disabled={!newPostContent.trim()}
              className="w-full mt-2"
            >
              发表并召唤 AI 网友
            </Button>
          </div>

          {/* Local/App Settings */}
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-lg border border-[var(--color-line-soft)] overflow-hidden flex-shrink-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="font-bold text-[var(--color-text)]">本地与 API 设置</span>
              <span className="text-xs font-semibold text-[var(--color-muted)]">
                {showSettings ? '收起' : '展开'}
              </span>
            </button>

            {showSettings && (
              <div className="px-4 pb-4 border-t border-[var(--color-line-soft)] flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <button
                    onClick={() => setAiSettings(prev => ({ ...prev, provider: 'local' }))}
                    className={`text-xs sm:text-sm min-h-10 px-2 py-2 rounded-xl border transition-all whitespace-nowrap ${
                      aiSettings.provider === 'local'
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] font-bold'
                        : 'border-[var(--color-line-soft)] text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]'
                    }`}
                  >
                    本地语料
                  </button>
                  <button
                    onClick={() => setAiSettings(prev => ({
                      ...prev,
                      provider: 'openai-compatible',
                      model: prev.model || 'gpt-4o-mini',
                      baseUrl: prev.baseUrl || 'https://api.openai.com/v1',
                    }))}
                    className={`text-xs sm:text-sm min-h-10 px-2 py-2 rounded-xl border transition-all whitespace-nowrap ${
                      aiSettings.provider === 'openai-compatible'
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-soft)] text-[var(--color-secondary-strong)] font-bold'
                        : 'border-[var(--color-line-soft)] text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]'
                    }`}
                  >
                    通用 API
                  </button>
                  <button
                    onClick={() => setAiSettings(prev => ({
                      ...prev,
                      provider: 'gemini',
                      model: prev.model && prev.model !== 'gpt-4o-mini' ? prev.model : 'gemini-2.5-flash',
                    }))}
                    className={`text-xs sm:text-sm min-h-10 px-2 py-2 rounded-xl border transition-all whitespace-nowrap ${
                      aiSettings.provider === 'gemini'
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-soft)] text-[var(--color-secondary-strong)] font-bold'
                        : 'border-[var(--color-line-soft)] text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]'
                    }`}
                  >
                    Gemini
                  </button>
                </div>

                <div className="text-xs leading-relaxed text-[var(--color-muted)]">
                  默认只保存在本机浏览器里。启用外部 API 后，树洞内容会发送给你配置的 API 服务商。
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--color-muted)]">树洞名称</label>
                  <input
                    type="text"
                    value={aiSettings.appName || ''}
                    onChange={e => setAiSettings(prev => ({ ...prev, appName: e.target.value.slice(0, 24) }))}
                    placeholder={DEFAULT_APP_NAME}
                    className="w-full min-h-11 text-sm border border-[var(--color-line)] bg-[var(--color-field)] rounded-xl px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-bold text-[var(--color-muted)]">界面风格</label>
                    <span className="text-[11px] text-[var(--color-muted)]">{activeTheme.description}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PRESETS.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setAiSettings(prev => ({ ...prev, themeId: theme.id }))}
                        className={`min-h-14 rounded-xl border px-3 py-2 text-left transition-all ${
                          activeTheme.id === theme.id
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-sm'
                            : 'border-[var(--color-line-soft)] hover:bg-[var(--color-surface-soft)]'
                        }`}
                      >
                        <span className="mb-1 flex items-center gap-1.5">
                          {[theme.colors.accent, theme.colors.secondary, theme.colors.headerC].map(color => (
                            <span
                              key={color}
                              className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                        <span className="block text-xs font-bold text-[var(--color-text)]">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {aiSettings.provider !== 'local' && (
                  <div className="flex flex-col gap-2">
                    {aiSettings.provider === 'openai-compatible' && (
                      <input
                        type="text"
                        value={aiSettings.baseUrl || ''}
                        onChange={e => setAiSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder="https://api.openai.com/v1"
                        className="w-full min-h-11 text-sm border border-[var(--color-line)] bg-[var(--color-field)] rounded-xl px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                      />
                    )}
                    <input
                      type="password"
                      value={aiSettings.apiKey || ''}
                      onChange={e => setAiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={aiSettings.provider === 'gemini' ? 'GEMINI_API_KEY' : 'API Key，可本地模型留空'}
                      className="w-full min-h-11 text-sm border border-[var(--color-line)] bg-[var(--color-field)] rounded-xl px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                    />
                    <input
                      type="text"
                      value={aiSettings.model || ''}
                      onChange={e => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                      placeholder={aiSettings.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini / deepseek-chat / 本地模型名'}
                      className="w-full min-h-11 text-sm border border-[var(--color-line)] bg-[var(--color-field)] rounded-xl px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30"
                    />
                    {aiSettings.provider === 'openai-compatible' && (
                      <div className="text-[11px] leading-relaxed text-[var(--color-muted)]">
                        适合 OpenAI、OpenRouter、DeepSeek、LM Studio、Ollama 等兼容 /chat/completions 的接口。
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post History List */}
          <div className="min-h-64 bg-[var(--color-surface)] rounded-3xl shadow-lg border border-[var(--color-line-soft)] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-[var(--color-line-soft)] bg-[var(--color-accent-soft)]/60">
               <div className="flex items-center justify-between gap-3">
                 <h3 className="font-bold text-[var(--color-text)]">我的树洞列表</h3>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={handleExportPosts}
                     disabled={posts.length === 0}
                     className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-secondary-strong)] disabled:opacity-30 disabled:hover:text-[var(--color-muted)] transition-colors"
                   >
                     导出
                   </button>
                   <button
                     onClick={() => importInputRef.current?.click()}
                     className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-secondary-strong)] transition-colors"
                   >
                     导入
                   </button>
                   <button
                     onClick={handleClearPosts}
                     disabled={posts.length === 0}
                     className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-accent-strong)] disabled:opacity-30 disabled:hover:text-[var(--color-muted)] transition-colors"
                   >
                     清空
                   </button>
                   <input
                     ref={importInputRef}
                     type="file"
                     accept="application/json,.json"
                     className="hidden"
                     onChange={event => handleImportPosts(event.target.files?.[0] || null)}
                   />
                 </div>
               </div>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {posts.length === 0 && (
                  <div className="text-center py-10 text-[var(--color-muted)] text-sm">
                    还没有树洞哦<br/>去写一条吧！
                  </div>
                )}
                {posts.map(post => (
                  <div 
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border-l-4 ${
                      selectedPostId === post.id 
                        ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] shadow-sm' 
                        : 'hover:bg-[var(--color-surface-soft)] border-transparent hover:border-[var(--color-line)]'
                    }`}
                  >
                    <p className="text-sm text-[var(--color-text)] font-medium line-clamp-2 mb-1">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center gap-2 text-[10px] text-[var(--color-muted)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="bg-[var(--color-line-soft)] px-2 py-0.5 rounded-full text-[var(--color-muted)]">
                          {MOOD_OPTIONS.find(m => m.value === post.mood)?.label.split(' ')[1] || post.mood}
                        </span>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="px-2 py-0.5 rounded-full hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)] transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Right Column: Detail View (Takes 8 cols on desktop) */}
        <section className="lg:col-span-7 xl:col-span-8 h-full">
          {selectedPost ? (
            <div className="bg-[var(--color-surface)] rounded-[2rem] shadow-xl border border-[var(--color-line-soft)] overflow-hidden min-h-[80vh] flex flex-col relative">
              
              {/* Post Content Header */}
              <div className="p-8 border-b border-[var(--color-line)]" style={{ background: `linear-gradient(135deg, ${activeTheme.colors.headerA}, ${activeTheme.colors.headerB}, ${activeTheme.colors.headerC})` }}>
                <div className="flex items-center gap-3 mb-4">
                   <div className="bg-[var(--color-surface)] px-3 py-1 rounded-full text-sm font-bold text-[var(--color-accent-strong)] shadow-sm">
                     {MOOD_OPTIONS.find(m => m.value === selectedPost.mood)?.label}
                   </div>
                   <div className="text-[var(--color-muted)] text-xs">
                     {new Date(selectedPost.createdAt).toLocaleString()}
                   </div>
                </div>
                <div className="text-lg md:text-xl text-[var(--color-text)] leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              {/* Comments Header & Actions */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-line-soft)] bg-[var(--color-surface)] sticky top-0 z-10">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                  <span>💬</span> 评论区 ({selectedPost.comments.length})
                </h3>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleRefreshComments}
                  isLoading={isRefreshingComments}
                >
                  {isRefreshingComments ? 'AI 赶路中...' : '召唤更多网友'}
                </Button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-surface-soft)]/50">
                 {selectedPost.comments.length === 0 ? (
                   <div className="text-center py-20 text-[var(--color-muted)]">
                     <div className="animate-pulse mb-2">✨</div>
                     AI 网友们正在赶来吃瓜...
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {selectedPost.comments.map(comment => (
                       <CommentCard 
                         key={comment.id} 
                         comment={comment}
                         onLike={handleLikeComment}
                         onReply={handleReplyToComment}
                       />
                     ))}
                     {isRefreshingComments && (
                       <div className="text-center py-8 text-[var(--color-secondary-strong)] text-sm animate-pulse">
                         正在生成新的神回复...
                       </div>
                     )}
                   </div>
                 )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-muted)]/60 bg-[var(--color-surface)]/60 rounded-[2rem] border-2 border-dashed border-[var(--color-line)]">
              <span className="text-6xl mb-4">👈</span>
              <p className="text-lg">请在左侧选择或创建一个树洞帖子</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
