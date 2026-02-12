import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed
    const dismissed = localStorage.getItem('woofwoof_install_dismissed');
    if (dismissed) return;

    // Check if already in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      return;
    }

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari: detect and show instructions
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) && !/crios|fxios|chrome/.test(navigator.userAgent.toLowerCase());
    if (isIos && isSafari) {
      // Show iOS prompt after a short delay
      const timer = setTimeout(() => setShowIosPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[WoofWoof] App installed');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIosPrompt(false);
    localStorage.setItem('woofwoof_install_dismissed', 'true');
  };

  // Android / Chrome install banner
  if (showInstallBanner) {
    return (
      <div className="install-prompt">
        <div className="install-prompt-content">
          <div className="install-prompt-icon">🐾</div>
          <div className="install-prompt-text">
            <strong>{t('install.title')}</strong>
            <span>{t('install.description')}</span>
          </div>
        </div>
        <div className="install-prompt-actions">
          <button className="install-dismiss-btn" onClick={handleDismiss}>
            {t('install.dismiss')}
          </button>
          <button className="install-action-btn" onClick={handleInstallClick}>
            {t('install.button')}
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari instructions
  if (showIosPrompt) {
    return (
      <div className="install-prompt install-prompt-ios">
        <div className="install-prompt-content">
          <div className="install-prompt-icon">🐾</div>
          <div className="install-prompt-text">
            <strong>{t('install.iosTitle')}</strong>
            <span>
              {t('install.iosStep1')} {t('install.iosShare')} {t('install.iosStep2')}
            </span>
          </div>
        </div>
        <div className="install-prompt-actions">
          <button className="install-dismiss-btn" onClick={handleDismiss}>
            {t('install.dismiss')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default InstallPrompt;
