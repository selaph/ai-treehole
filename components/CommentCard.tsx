import React, { useState } from 'react';
import { Comment, Reply } from '../types';
import { PERSONA_COLORS, DEFAULT_AVATAR_COLOR } from '../constants';
import { Button } from './Button';

interface CommentCardProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, text: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, onLike, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const bgColor = PERSONA_COLORS[comment.personaType] || DEFAULT_AVATAR_COLOR;
  const isLiked = !!comment.likedByMe;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm border border-[var(--color-line-soft)] hover:shadow-md transition-shadow mb-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div 
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-inner"
          style={{ backgroundColor: bgColor }}
        >
          {comment.nickname.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-[var(--color-text)]">{comment.nickname}</span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium opacity-80"
              style={{ backgroundColor: bgColor, color: '#444' }}
            >
              {comment.personaType}
            </span>
          </div>

          {/* Content */}
          <p className="text-[var(--color-text)]/90 text-sm leading-relaxed whitespace-pre-wrap mb-3">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-xs font-medium text-[var(--color-muted)]">
            <button 
              onClick={() => onLike(comment.id)}
              aria-pressed={isLiked}
              aria-label={isLiked ? '取消点赞' : '点赞'}
              className={`flex items-center gap-1 transition-colors group ${
                isLiked ? 'text-[var(--color-accent-strong)] font-bold' : 'hover:text-[var(--color-accent-strong)]'
              }`}
            >
              <span className={`transition-transform ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`}>👍</span>
              {comment.likes}
            </button>
            <button 
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="hover:text-[var(--color-secondary-strong)] transition-colors"
            >
              回复
            </button>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 flex gap-2 animate-fade-in-down">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="回怼一下或者感谢..."
                className="flex-1 text-sm border border-[var(--color-line)] bg-[var(--color-field)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              />
              <Button size="sm" onClick={handleSendReply}>
                发送
              </Button>
            </div>
          )}

          {/* Replies List */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-3 border-l-2 border-[var(--color-line-soft)]">
              {comment.replies.map(reply => (
                <div key={reply.id} className="bg-[var(--color-field)] rounded-lg p-2 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-xs ${reply.author === '楼主' ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-muted)]'}`}>
                      {reply.author}
                    </span>
                    <span className="text-[var(--color-muted)]/60 text-[10px]">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[var(--color-text)]/90">{reply.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
