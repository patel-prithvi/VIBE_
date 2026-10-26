import React, { useState, useEffect } from 'react';

const Avatar = ({ 
  name = '', 
  src = '', 
  className = '', 
  initialsClassName = '',
  variant = 'default', // 'default' | 'faculty' | 'navy' | 'purple'
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  const isMockPlaceholder =
    typeof src === 'string' &&
    (src.includes('picsum.photos') ||
     src.includes('via.placeholder.com') ||
     src.includes('ui-avatars.com'));

  const hasImage = Boolean(
    src &&
    typeof src === 'string' &&
    src.trim().length > 0 &&
    !isMockPlaceholder &&
    !imageError
  );

  if (hasImage) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${className} object-cover block`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Purple palette matching VIBE active sidebar and dashboard theme (#6D3DF5)
  const bgStyles =
    variant === 'faculty' || variant === 'purple' || variant === 'default'
      ? 'bg-[#6D3DF5] text-white border border-[#5B2FD6]'
      : 'bg-[#6D3DF5] text-white';

  return (
    <div className={`${className} flex items-center justify-center ${bgStyles} overflow-hidden shadow-xs select-none`}>
      <span className={`font-bold tracking-tight text-white ${initialsClassName}`}>
        {getInitials(name)}
      </span>
    </div>
  );
};

export default Avatar;
