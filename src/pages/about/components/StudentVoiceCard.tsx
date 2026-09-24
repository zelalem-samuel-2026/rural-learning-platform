import React from 'react';

interface StudentVoiceCardProps {
  voice: { title?: string; description?: string; quote?: string } | string;
}

export const StudentVoiceCard: React.FC<StudentVoiceCardProps> = ({ voice }) => {
  const content = typeof voice === 'string' ? voice : voice.quote || voice.description || voice.title || '';
  return <div>{content}</div>;
};
