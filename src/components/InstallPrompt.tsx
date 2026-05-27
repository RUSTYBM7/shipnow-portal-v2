/**
 * PWA Install Prompt Component
 * Shows a banner when PWA installation is available
 */

import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

interface InstallPromptProps {
  autoShow?: boolean;
  showDelay?: number; // ms before showing
  maxShows?: number; // times to show
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  autoShow = true,
  showDelay = 3000,
  maxShows = 3
}) => {
  const {
    installPrompt,
    installPWA,
    dismissInstallPrompt,
    isInstalled,
    deviceInfo
  } = usePWA();

  const [isVisible, setIsVisible] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    // Check if should show based on previous dismissals
    if (!autoShow) return;
    if (isInstalled) return;
    if (!installPrompt.canInstall) return;

    // Check localStorage for dismissed state
    const dismissedTime = localStorage.getItem('pwaInstallDismissed');
    if (dismissedTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) return; // Don't show for 24 hours after dismissal
    }

    // Check show count
    const previousCount = localStorage.getItem('pwaInstallShowCount');
    if (previousCount && parseInt(previousCount) >= maxShows) return;

    // Delay before showing
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem('pwaInstallShowCount', newCount.toString());
        return newCount;
      });
    }, showDelay);

    return () => clearTimeout(timer);
  }, [autoShow, isInstalled, installPrompt.canInstall, showDelay, maxShows]);

  if (!installPrompt.canInstall || isInstalled || !isVisible) {
    return null;
  }

  // Different UI for iOS vs Android/Desktop
  if (deviceInfo.os === 'ios' && deviceInfo.isMobile) {
    return <IOSInstallPrompt onDismiss={dismissInstallPrompt} />;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="pwa-install-text">
          <h3>Install AirPak Express</h3>
          <p>Get the app for faster access and offline support</p>
        </div>
        <div className="pwa-install-actions">
          <button
            className="btn-install"
            onClick={() => {
              installPWA();
              setIsVisible(false);
            }}
          >
            Install
          </button>
          <button
            className="btn-dismiss"
            onClick={() => {
              dismissInstallPrompt();
              setIsVisible(false);
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

// iOS-specific install instructions
export const IOSInstallPrompt: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);

  return (
    <div className="pwa-install-prompt ios-install">
      <div className="pwa-install-content">
        {step === 0 ? (
          <>
            <div className="pwa-install-icon ios-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="pwa-install-text">
              <h3>Add to Home Screen</h3>
              <p>Install AirPak Express on your iPhone for quick access</p>
            </div>
            <button className="btn-next" onClick={() => setStep(1)}>
              How to install
            </button>
            <button className="btn-dismiss" onClick={onDismiss}>
              Not now
            </button>
          </>
        ) : (
          <div className="ios-steps">
            <h4>Follow these steps:</h4>
            <ol>
              <li>
                <span className="step-icon">1</span>
                Tap the share button <span className="icon-inline">⬆</span> in your browser
              </li>
              <li>
                <span className="step-icon">2</span>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </li>
              <li>
                <span className="step-icon">3</span>
                Tap <strong>"Add"</strong> in the top right
              </li>
            </ol>
            <button className="btn-dismiss full-width" onClick={onDismiss}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Update notification banner
export const UpdatePrompt: React.FC<{ onUpdate: () => void; onDismiss: () => void }> = ({
  onUpdate,
  onDismiss
}) => {
  return (
    <div className="pwa-update-prompt">
      <div className="pwa-update-content">
        <div className="update-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="update-text">
          <h4>Update Available</h4>
          <p>A new version is ready. Update now for the latest features.</p>
        </div>
        <div className="update-actions">
          <button className="btn-update" onClick={onUpdate}>
            Update
          </button>
          <button className="btn-later" onClick={onDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

// Offline indicator
export const OfflineIndicator: React.FC = () => {
  const [show, setShow] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setShow(false);
    const handleOffline = () => setShow(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="offline-indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>You're offline. Some features may be limited.</span>
    </div>
  );
};

export default InstallPrompt;