import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white font-medium flex items-center gap-2 transition-all duration-300 ${isOnline
          ? 'bg-green-500 shadow-lg'
          : 'bg-red-500 shadow-lg'
        }`}
      style={{
        animation: showStatus ? 'slideDown 0.3s ease-out' : 'none'
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>Back Online</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  );
};

export default PWAStatus;