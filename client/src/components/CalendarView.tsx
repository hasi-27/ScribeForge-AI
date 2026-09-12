import React, { useState } from 'react';
import { PostObject } from '../types';
import { Calendar as CalendarIcon, Clock, Layers, Eye, Hash } from 'lucide-react';

interface CalendarViewProps {
  posts: PostObject[];
  onSelectPost: (post: PostObject) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onSelectPost }) => {
  // Sort posts by date
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="glass-panel calendar-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={16} className="text-cyan-400" />
          <span>Scheduled Content Timeline ({posts.length} Posts)</span>
        </h4>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Click any card to inspect or modify
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {sortedPosts.map((post) => {
          const dateObj = new Date(post.date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={post.post_number}
              className="glass-panel"
              style={{
                padding: '16px',
                borderLeft: '4px solid #6366f1',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
              onClick={() => onSelectPost(post)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#6366f1', fontFamily: 'Outfit' }}>
                    Post #{post.post_number}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {dayName}, {monthDay}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8'
                  }}
                >
                  {post.content_type}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {post.caption}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>
                  {post.content_angle || 'Spotlight'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {post.hashtags.length} tags
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
