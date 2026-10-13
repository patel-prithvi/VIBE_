import { registerSW } from 'virtual:pwa-register';

// Register service worker with automatic updates
export const registerServiceWorker = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show a prompt to user to refresh the app
      if (confirm('New content available, reload?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
      // You can show a toast notification here
      showOfflineReadyNotification();
    },
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });
};

// Show offline ready notification
const showOfflineReadyNotification = () => {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      animation: slideInRight 0.3s ease-out;
    ">
      ✅ App is ready to work offline!
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
};

// Check if app is running in standalone mode (installed as PWA)
export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Check if device is iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if device is Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Get install prompt for manual installation
export const getInstallPrompt = () => {
  return new Promise((resolve) => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      resolve(e);
    });
  });
};