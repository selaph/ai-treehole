export interface Reply {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  personaType: string;
  nickname: string;
  avatarColor: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  replies: Reply[];
}

export interface Post {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
  comments: Comment[];
}

export interface GeneratedCommentData {
  personaType: string;
  nickname: string;
  toneHint: string;
  text: string;
}

export enum MoodType {
  SAD = '丧丧',
  LAZY = '摸鱼',
  ANGRY = '生气',
  HUG = '想被抱抱',
  RANDOM = '胡思乱想',
  HAPPY = '开心',
}
