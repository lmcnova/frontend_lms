/**
 * Security Protection Utilities
 * Protects against: DevTools, Screenshots, Screen Recording, Downloads, Copying
 */

// Store original console methods before overriding
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// DevTools detection state
let devToolsOpen = false;
let devToolsCheckInterval = null;

// Fullscreen state - to prevent blur during fullscreen mode
let isFullscreen = false;
let fullscreenTransitioning = false;

/**
 * Detect if DevTools is open using various methods
 */
const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  // Method 1: Window size difference
  if (widthThreshold || heightThreshold) {
    return true;
  }

  // Method 2: Using debugger timing
  const start = performance.now();
  debugger;
  const end = performance.now();
  if (end - start > 100) {
    return true;
  }

  return false;
};

/**
 * Handle DevTools detection
 */
const handleDevToolsDetection = (callback) => {
  const isOpen = detectDevTools();

  if (isOpen !== devToolsOpen) {
    devToolsOpen = isOpen;
    if (callback) {
      callback(isOpen);
    }
  }
};

/**
 * Show capture warning overlay
 */
let captureWarningElement = null;
const showCaptureWarning = () => {
  if (captureWarningElement) return;

  captureWarningElement = document.createElement('div');
  captureWarningElement.className = 'capture-warning-overlay';
  captureWarningElement.innerHTML = '<span>Screen capture is not allowed. Please return to the application.</span>';
  document.body.appendChild(captureWarningElement);
};

/**
 * Hide capture warning overlay
 */
const hideCaptureWarning = () => {
  if (captureWarningElement) {
    captureWarningElement.remove();
    captureWarningElement = null;
  }
};

/**
 * Trigger protection when capture is detected
 */
const triggerCaptureProtection = () => {
  document.body.classList.add('security-blur');
  document.body.classList.add('capture-active');
  showCaptureWarning();

  // Also blur all video elements immediately
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.style.filter = 'blur(100px) brightness(0.1)';
    video.style.transition = 'none';
  });
};

/**
 * Release protection when capture stops
 */
const releaseCaptureProtection = () => {
  document.body.classList.remove('security-blur');
  document.body.classList.remove('capture-active');
  hideCaptureWarning();

  // Restore video elements
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.style.filter = '';
    video.style.transition = '';
  });

  // Restore image elements
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.filter = '';
    img.style.transition = '';
  });
};

/**
 * Instant blur for screenshot protection - blur BEFORE capture happens
 */
const instantBlurForScreenshot = () => {
  // Immediately hide all video/image content
  document.body.classList.add('security-blur');
  document.body.classList.add('capture-active');

  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.style.filter = 'blur(100px) brightness(0.1)';
    video.style.transition = 'none';
  });

  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.filter = 'blur(50px) brightness(0.2)';
    img.style.transition = 'none';
  });

  showCaptureWarning();
};

/**
 * Block keyboard shortcuts for DevTools and source view
 */
const blockKeyboardShortcuts = (e) => {
  // CRITICAL: Detect Windows key press - blur IMMEDIATELY before Snipping Tool opens
  // Windows key is 'Meta' on Windows
  if (e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92) {
    instantBlurForScreenshot();
  }

  // Also blur on Shift key if Meta/Windows is held (Win+Shift+S preparation)
  if (e.shiftKey && (e.metaKey || e.key === 'Shift')) {
    instantBlurForScreenshot();
  }

  // F12 - DevTools
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+Shift+I - DevTools
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+Shift+J - Console
  if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+Shift+C - Element inspector
  if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+U - View source
  if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+S - Save page
  if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+P - Print
  if (e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+Shift+K - Firefox console
  if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Ctrl+Shift+M - Responsive design mode
  if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm' || e.keyCode === 77)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // PrintScreen - Screenshot - BLUR FIRST then block
  if (e.key === 'PrintScreen' || e.keyCode === 44) {
    instantBlurForScreenshot();
    e.preventDefault();
    e.stopPropagation();
    // Clear clipboard after a short delay
    setTimeout(() => {
      navigator.clipboard.writeText('Screenshot blocked').catch(() => {});
    }, 100);
    return false;
  }

  // Windows + Shift + S - Snipping tool - Already blurred by Meta key detection above
  if (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
    instantBlurForScreenshot();
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Alt + PrintScreen - Window screenshot
  if (e.altKey && (e.key === 'PrintScreen' || e.keyCode === 44)) {
    instantBlurForScreenshot();
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  return true;
};

/**
 * Handle key up to restore content after screenshot attempt
 */
const handleKeyUpRestore = (e) => {
  // Restore content when Windows/Meta key is released
  if (e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92) {
    setTimeout(() => {
      if (document.hasFocus()) {
        releaseCaptureProtection();
      }
    }, 1000);
  }

  // Also handle PrintScreen key up
  if (e.key === 'PrintScreen' || e.keyCode === 44) {
    // Keep blurred for a bit longer, then clear clipboard
    setTimeout(() => {
      navigator.clipboard.writeText('Screenshot blocked').catch(() => {});
      if (document.hasFocus()) {
        releaseCaptureProtection();
      }
    }, 1500);
  }
};

/**
 * Block right-click context menu
 */
const blockContextMenu = (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

/**
 * Block text selection
 */
const blockSelection = (e) => {
  e.preventDefault();
  return false;
};

/**
 * Block drag events (prevents saving images/content)
 */
const blockDrag = (e) => {
  e.preventDefault();
  return false;
};

/**
 * Block copy events
 */
const blockCopy = (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

/**
 * Block cut events
 */
const blockCut = (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

/**
 * Handle visibility change (screenshot/screen recording detection)
 */
let visibilityCallback = null;
const handleVisibilityChange = () => {
  if (document.hidden) {
    // Page is hidden - possible screenshot or screen recording
    document.body.classList.add('security-blur');
  } else {
    // Page is visible again
    setTimeout(() => {
      document.body.classList.remove('security-blur');
    }, 500);
  }

  if (visibilityCallback) {
    visibilityCallback(document.hidden);
  }
};

/**
 * Handle window blur (Snipping Tool, screen recording, alt+tab detection)
 */
const handleWindowBlur = () => {
  // Skip if in fullscreen mode - don't blur during fullscreen
  if (isFullscreen || fullscreenTransitioning) return;

  document.body.classList.add('security-blur');
  document.body.classList.add('capture-active');
  showCaptureWarning();
};

/**
 * Handle window focus (when user returns to the app)
 */
const handleWindowFocus = () => {
  setTimeout(() => {
    document.body.classList.remove('security-blur');
    document.body.classList.remove('capture-active');
    hideCaptureWarning();
  }, 500);
};

/**
 * Advanced screen capture detection using multiple methods
 */
let captureDetectionInterval = null;
let captureAnimationFrame = null;
let lastPixelRatio = window.devicePixelRatio;
let isCapturing = false;
let lastFocusState = true;

/**
 * Check if document is in fullscreen mode
 */
const checkFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

/**
 * Handle fullscreen change - don't trigger protection during fullscreen
 */
const handleFullscreenChange = () => {
  isFullscreen = checkFullscreen();
  fullscreenTransitioning = true;

  // Allow time for fullscreen transition to complete
  setTimeout(() => {
    fullscreenTransitioning = false;
    // If in fullscreen and was blurred, release protection
    if (isFullscreen) {
      releaseCaptureProtection();
    }
  }, 500);
};

const startAdvancedCaptureDetection = () => {
  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Method 1: Monitor for device pixel ratio changes (screenshot tools can affect this)
  const checkPixelRatio = () => {
    // Skip if in fullscreen or transitioning
    if (isFullscreen || fullscreenTransitioning) return;

    if (window.devicePixelRatio !== lastPixelRatio) {
      triggerCaptureProtection();
      lastPixelRatio = window.devicePixelRatio;
    }
  };

  // Method 2: Ultra-fast focus detection using requestAnimationFrame
  const checkWindowState = () => {
    // Skip if in fullscreen or transitioning
    if (isFullscreen || fullscreenTransitioning) {
      captureAnimationFrame = requestAnimationFrame(checkWindowState);
      return;
    }

    const hasFocus = document.hasFocus();

    // Detect focus change immediately
    if (hasFocus !== lastFocusState) {
      lastFocusState = hasFocus;

      if (!hasFocus) {
        // Lost focus - immediately protect content
        isCapturing = true;
        triggerCaptureProtection();
      } else {
        // Regained focus - delay before removing protection
        setTimeout(() => {
          if (document.hasFocus()) {
            isCapturing = false;
            releaseCaptureProtection();
          }
        }, 800);
      }
    }

    // Continue monitoring every frame
    captureAnimationFrame = requestAnimationFrame(checkWindowState);
  };

  // Method 3: Check for screen recording API usage
  const monitorMediaDevices = () => {
    if (navigator.mediaDevices) {
      const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
      navigator.mediaDevices.enumerateDevices = async function() {
        const devices = await originalEnumerateDevices.call(navigator.mediaDevices);
        // Check if any screen capture device is active
        const hasScreenCapture = devices.some(device =>
          device.kind === 'videoinput' && device.label.toLowerCase().includes('screen')
        );
        if (hasScreenCapture && !isFullscreen) {
          triggerCaptureProtection();
        }
        return devices;
      };
    }
  };

  // Method 4: Monitor mouse leaving the window (indicates possible capture tool selection)
  const handleMouseLeave = () => {
    // Skip if in fullscreen or transitioning
    if (isFullscreen || fullscreenTransitioning) return;
    triggerCaptureProtection();
  };

  const handleMouseEnter = () => {
    if (document.hasFocus()) {
      setTimeout(() => {
        if (document.hasFocus()) {
          releaseCaptureProtection();
        }
      }, 300);
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('mouseenter', handleMouseEnter);

  // Start ultra-fast monitoring with requestAnimationFrame
  captureAnimationFrame = requestAnimationFrame(checkWindowState);

  // Also use interval as backup
  captureDetectionInterval = setInterval(() => {
    checkPixelRatio();
  }, 50);

  monitorMediaDevices();

  // Also listen for resize events (snipping tool can cause resize)
  window.addEventListener('resize', () => {
    // Skip if in fullscreen or transitioning - resize happens during fullscreen
    if (isFullscreen || fullscreenTransitioning) return;

    triggerCaptureProtection();
    setTimeout(() => {
      if (document.hasFocus()) {
        releaseCaptureProtection();
      }
    }, 500);
  });
};

/**
 * Prevent PrintScreen by clearing clipboard
 */
const handleKeyUp = (e) => {
  if (e.key === 'PrintScreen' || e.keyCode === 44) {
    navigator.clipboard.writeText('').catch(() => {});
    document.body.classList.add('security-blur');
    setTimeout(() => {
      document.body.classList.remove('security-blur');
    }, 1000);
  }
};

/**
 * Detect screen capture/recording using Screen Capture API
 */
const detectScreenCapture = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getDisplayMedia = async function(constraints) {
      // Log attempt
      console.warn('Screen capture attempt detected');
      // You can block or allow based on requirements
      throw new Error('Screen capture is not allowed');
    };
  }
};

/**
 * Disable console methods in production
 */
const disableConsole = () => {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
  console.dir = noop;
  console.table = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.clear = noop;
};

/**
 * Add watermark overlay (for screen recording detection)
 */
export const addWatermark = (userInfo = '') => {
  const existingWatermark = document.getElementById('security-watermark');
  if (existingWatermark) {
    existingWatermark.remove();
  }

  const watermark = document.createElement('div');
  watermark.id = 'security-watermark';
  watermark.className = 'security-watermark';

  // Create multiple watermark text elements
  const text = userInfo || `Protected Content - ${new Date().toISOString()}`;
  watermark.innerHTML = `
    <div class="watermark-text">${text}</div>
    <div class="watermark-text">${text}</div>
    <div class="watermark-text">${text}</div>
    <div class="watermark-text">${text}</div>
    <div class="watermark-text">${text}</div>
    <div class="watermark-text">${text}</div>
  `;

  document.body.appendChild(watermark);
};

/**
 * Remove watermark
 */
export const removeWatermark = () => {
  const watermark = document.getElementById('security-watermark');
  if (watermark) {
    watermark.remove();
  }
};

/**
 * Initialize all security protections
 */
export const initSecurityProtection = (options = {}) => {
  const {
    disableDevTools = true,
    disableRightClick = true,
    disableKeyboardShortcuts = true,
    disableCopy = true,
    disableDrag = true,
    disableSelection = false,
    disableConsoleInProduction = true,
    enableScreenCaptureProtection = true,
    enableVisibilityProtection = true,
    enableWatermark = false,
    watermarkText = '',
    onDevToolsOpen = null,
    onVisibilityChange = null,
  } = options;

  // Block keyboard shortcuts
  if (disableKeyboardShortcuts) {
    document.addEventListener('keydown', blockKeyboardShortcuts, { capture: true });
    document.addEventListener('keyup', handleKeyUpRestore, { capture: true });
  }

  // Block right-click
  if (disableRightClick) {
    document.addEventListener('contextmenu', blockContextMenu, { capture: true });
  }

  // Block copy
  if (disableCopy) {
    document.addEventListener('copy', blockCopy, { capture: true });
    document.addEventListener('cut', blockCut, { capture: true });
  }

  // Block drag
  if (disableDrag) {
    document.addEventListener('dragstart', blockDrag, { capture: true });
    document.addEventListener('drop', blockDrag, { capture: true });
  }

  // Block selection
  if (disableSelection) {
    document.addEventListener('selectstart', blockSelection, { capture: true });
  }

  // DevTools detection
  if (disableDevTools && onDevToolsOpen) {
    devToolsCheckInterval = setInterval(() => {
      handleDevToolsDetection(onDevToolsOpen);
    }, 1000);
  }

  // Visibility change detection (screenshot protection)
  if (enableVisibilityProtection) {
    visibilityCallback = onVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window blur/focus detection (Snipping Tool, screen recording)
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // PrintScreen key detection
    document.addEventListener('keyup', handleKeyUp, { capture: true });
  }

  // Screen capture protection
  if (enableScreenCaptureProtection) {
    detectScreenCapture();
    startAdvancedCaptureDetection();
  }

  // Disable console in production
  if (disableConsoleInProduction && import.meta.env.PROD) {
    disableConsole();
  }

  // Add watermark
  if (enableWatermark) {
    addWatermark(watermarkText);
  }

  // Return cleanup function
  return () => {
    if (disableKeyboardShortcuts) {
      document.removeEventListener('keydown', blockKeyboardShortcuts, { capture: true });
      document.removeEventListener('keyup', handleKeyUpRestore, { capture: true });
    }
    if (disableRightClick) {
      document.removeEventListener('contextmenu', blockContextMenu, { capture: true });
    }
    if (disableCopy) {
      document.removeEventListener('copy', blockCopy, { capture: true });
      document.removeEventListener('cut', blockCut, { capture: true });
    }
    if (disableDrag) {
      document.removeEventListener('dragstart', blockDrag, { capture: true });
      document.removeEventListener('drop', blockDrag, { capture: true });
    }
    if (disableSelection) {
      document.removeEventListener('selectstart', blockSelection, { capture: true });
    }
    if (devToolsCheckInterval) {
      clearInterval(devToolsCheckInterval);
    }
    if (enableVisibilityProtection) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
    }
    if (enableScreenCaptureProtection) {
      if (captureDetectionInterval) {
        clearInterval(captureDetectionInterval);
        captureDetectionInterval = null;
      }
      if (captureAnimationFrame) {
        cancelAnimationFrame(captureAnimationFrame);
        captureAnimationFrame = null;
      }
      hideCaptureWarning();
    }
    if (enableWatermark) {
      removeWatermark();
    }
  };
};

/**
 * Hook for using security protection in React components
 */
export const useSecurityProtection = (options = {}) => {
  return {
    init: () => initSecurityProtection(options),
    addWatermark,
    removeWatermark,
  };
};

export default {
  initSecurityProtection,
  useSecurityProtection,
  addWatermark,
  removeWatermark,
};
