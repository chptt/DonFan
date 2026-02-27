'use client';
import { useState } from 'react';

export default function InfluencerAvatar({ name, imageUrl, size = 'md' }) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  };
  
  const showImage = imageUrl && imageUrl.trim() !== '' && !imageError;
  
  return (
    <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden shadow-md`}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
}
