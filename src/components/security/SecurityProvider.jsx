import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store';
import { initSecurityProtection, addWatermark, removeWatermark } from '../../utils/securityProtection';

/**
 * SecurityProvider Component
 * Wraps the application with security protections against:
 * - DevTools inspection
 * - Screenshots
 * - Screen recording
 * - Right-click context menu
 * - Keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
 * - Content copying and downloading
 *
 * Applied to ALL pages globally
 */
const SecurityProvider = ({ children, enableWatermark = false }) => {
  const { user } = useAuthStore();

  // Handle DevTools detection
  const handleDevToolsOpen = useCallback((isOpen) => {
    if (isOpen) {
      document.body.classList.add('security-blur');
      console.warn('Security: DevTools detected');
    } else {
      document.body.classList.remove('security-blur');
    }
  }, []);

  // Handle visibility change (tab switch, minimize)
  const handleVisibilityChange = useCallback((isHidden) => {
    if (isHidden) {
      document.body.classList.add('security-blur');
    } else {
      setTimeout(() => {
        document.body.classList.remove('security-blur');
      }, 300);
    }
  }, []);

  useEffect(() => {
    // Add security classes to body
    document.body.classList.add('security-no-select', 'security-no-drag', 'security-protected');

    // Initialize security protections
    const cleanup = initSecurityProtection({
      disableDevTools: true,
      disableRightClick: true,
      disableKeyboardShortcuts: true,
      disableCopy: true,
      disableDrag: true,
      disableSelection: false, // Keep false to allow form inputs
      disableConsoleInProduction: true,
      enableScreenCaptureProtection: true,
      enableVisibilityProtection: true,
      enableWatermark: enableWatermark,
      watermarkText: user ? `${user.email} - ${user.uuid}` : 'Protected Content',
      onDevToolsOpen: handleDevToolsOpen,
      onVisibilityChange: handleVisibilityChange,
    });

    // Add watermark if user is logged in and watermark is enabled
    if (enableWatermark && user) {
      addWatermark(`${user.email} - ${new Date().toLocaleDateString()}`);
    }

    // Disable right-click on images and videos specifically
    const handleImageRightClick = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('contextmenu', handleImageRightClick);

    // Disable image/video dragging
    const images = document.querySelectorAll('img, video');
    images.forEach((img) => {
      img.setAttribute('draggable', 'false');
    });

    // Mutation observer to apply protection to dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG' || node.tagName === 'VIDEO') {
              node.setAttribute('draggable', 'false');
            }
            const mediaElements = node.querySelectorAll?.('img, video');
            mediaElements?.forEach((el) => {
              el.setAttribute('draggable', 'false');
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on unmount
    return () => {
      cleanup();
      observer.disconnect();
      document.removeEventListener('contextmenu', handleImageRightClick);
      document.body.classList.remove('security-no-select', 'security-no-drag', 'security-protected');
      removeWatermark();
    };
  }, [user, enableWatermark, handleDevToolsOpen, handleVisibilityChange]);

  // Update watermark when user changes
  useEffect(() => {
    if (enableWatermark && user) {
      addWatermark(`${user.email} - ${new Date().toLocaleDateString()}`);
    } else {
      removeWatermark();
    }
  }, [user, enableWatermark]);

  return <>{children}</>;
};

export default SecurityProvider;
