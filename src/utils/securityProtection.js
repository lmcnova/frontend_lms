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
 * Block keyboard shortcuts for DevTools and source view
 */
const blockKeyboardShortcuts = (e) => {
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

  // PrintScreen - Screenshot
  if (e.key === 'PrintScreen' || e.keyCode === 44) {
    e.preventDefault();
    e.stopPropagation();
    // Clear clipboard
    navigator.clipboard.writeText('').catch(() => {});
    return false;
  }

  // Windows + Shift + S - Snipping tool
  if (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  return true;
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
  document.body.classList.add('security-blur');
};

/**
 * Handle window focus (when user returns to the app)
 */
const handleWindowFocus = () => {
  setTimeout(() => {
    document.body.classList.remove('security-blur');
  }, 300);
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
