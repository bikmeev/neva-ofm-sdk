/**
 * NEVA OFM SDK v1.0.4 - neva-ofm.cc
 * Optimized with parallel loading and instant rendering
 */

(function(window, document) {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    apiUrl: 'https://api.neva-ofm.cc',
    theme: 'light',
    captchaProvider: 'both',
    hideCaptcha: true,
    size: 'normal',
    language: 'auto',
    retryAttempts: 3,
    timeout: 30000,
    mouseTracking: true,
    buttonText: 'Press here to see captcha',
    buttonEmoji: '👈',
    buttonColor: 'white',
    buttonEmojiAnimation: true,
    loaderTextColor: 'white',
    
    // Performance optimizations
    preloadBothProviders: false,
    instantRender: true,
    
    // Advanced protection
    randomContainers: true,
    minDummyContainers: 2,
    maxDummyContainers: 5
  };

  // Captcha script URLs
  const CAPTCHA_SCRIPTS = {
    turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
    hcaptcha: 'https://js.hcaptcha.com/1/api.js'
  };

  // Bot detection patterns
  const BOT_PATTERNS = {
    userAgents: [
      /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
      /headless/i, /phantom/i, /selenium/i, /webdriver/i
    ],
    properties: [
      'webdriver', '__nightmare', '_phantom', 'callPhantom', '__selenium_unwrapped'
    ],
    windowProperties: [
      'domAutomation', 'domAutomationController', '__webdriver_script_fn'
    ]
  };

  // Device detection
  const DEVICE_DETECTION = {
    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    tablet: /iPad|Android(?!.*Mobile)/i,
    desktop: /Windows|Macintosh|Linux/i,
    oldWindows: /Windows NT (5\.|6\.0|6\.1)/i
  };

  class AntiBot {
    constructor(siteKey, options = {}) {
      if (!siteKey) {
        throw new Error('AntiBot: siteKey is required');
      }

      this.siteKey = siteKey;
      this.config = this._deepMerge(DEFAULT_CONFIG, options);
      this.initialized = false;
      this.captchaLoaded = false;
      this.currentProvider = null;
      this.widgetId = null;
      this.token = null;
      this.siteConfig = null;
      this.cloakingConfig = null;
      this.cloakingActive = false;
      this.isBlocked = false;
      this.realContainerId = null;
      
      // Pending render queue
      this.pendingRenders = [];
      
      // Mouse tracking
      this.mouseMovements = [];
      this.isHumanLikely = false;
      this.buttonHoverTime = null;
      this.clickAttempts = 0;

      // Callbacks
      this.onSuccessCallback = null;
      this.onErrorCallback = null;
      this.onExpireCallback = null;
      this.onInitCallback = null;

      // Initialize
      this._init();
    }

    _deepMerge(target, source) {
      const output = { ...target };
      if (this._isObject(target) && this._isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this._isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = this._deepMerge(target[key], source[key]);
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }

    _isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }

    async _init() {
      try {
        // Parallel initialization: config + scripts
        const tasks = [];
        
        tasks.push(this._fetchSiteConfig());
        
        if (this.config.preloadBothProviders) {
          tasks.push(this._preloadCaptchaScripts());
        }
        
        await Promise.all(tasks);
        
        if (this.siteConfig.cloaking_enabled && this.cloakingConfig) {
          await this._applyCloaking();
        }
        
        if (this.isBlocked) {
          return;
        }
        
        this._determineCaptchaProvider();
        
        if (!this.config.preloadBothProviders) {
          await this._loadCaptchaScript();
        }
        
        if (this.config.mouseTracking) {
          this._setupMouseTracking();
        }
        
        this.initialized = true;
        
        this._executePendingRenders();
        
        if (this.onInitCallback) {
          this.onInitCallback();
        }
        
      } catch (error) {
        console.error('AntiBot initialization error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }

    async _fetchSiteConfig() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/config/${this.siteKey}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch site configuration');
        }
        
        this.siteConfig = await response.json();
        
        if (this.siteConfig.cloaking) {
          this.cloakingConfig = this.siteConfig.cloaking;
        }
        
        const currentDomain = window.location.hostname;
        const allowedDomains = this.siteConfig.allowed_domains || [];
        
        const isAllowed = allowedDomains.some(domain => 
          currentDomain === domain || currentDomain.endsWith(`.${domain}`)
        );
        
        if (!isAllowed) {
          throw new Error('Domain not authorized for this site key');
        }
      } catch (error) {
        throw new Error(`Site config fetch failed: ${error.message}`);
      }
    }

    async _preloadCaptchaScripts() {
      const promises = [
        this._loadScriptByUrl(CAPTCHA_SCRIPTS.turnstile),
        this._loadScriptByUrl(CAPTCHA_SCRIPTS.hcaptcha)
      ];
      
      try {
        await Promise.all(promises);
        this.captchaLoaded = true;
      } catch (error) {
        console.warn('Failed to preload some captcha scripts:', error);
      }
    }

    _loadScriptByUrl(url) {
      return new Promise((resolve, reject) => {
        if (this._isScriptLoaded(url)) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        
        document.head.appendChild(script);
      });
    }

    async _applyCloaking() {
      const botDetection = this._detectBot();
      const deviceCheck = this._checkDevice();
      const geoCheck = await this._checkGeolocation();
      
      let shouldBlock = false;
      let blockReason = '';

      const mode = this.cloakingConfig.mode || 'standard';
      
      if (mode === 'standard') {
        if (botDetection.isDefiniteBot || deviceCheck.isOldWindows) {
          shouldBlock = true;
          blockReason = botDetection.isDefiniteBot ? 'Bot detected' : 'Unsupported OS';
        }
      } else if (mode === 'moderate') {
        if (botDetection.score >= 3 || deviceCheck.isOldWindows) {
          shouldBlock = true;
          blockReason = 'Suspicious activity detected';
        }
      } else if (mode === 'aggressive') {
        if (botDetection.score >= 2 || deviceCheck.isOldWindows) {
          shouldBlock = true;
          blockReason = 'Security check failed';
        }
      }

      if (this.cloakingConfig.block_crawlers && botDetection.isCrawler) {
        shouldBlock = true;
        blockReason = 'Crawler blocked';
      }

      if (this.cloakingConfig.blocked_countries && this.cloakingConfig.blocked_countries.length > 0) {
        if (geoCheck.country && this.cloakingConfig.blocked_countries.includes(geoCheck.country)) {
          shouldBlock = true;
          blockReason = 'Geographic restriction';
        }
      }

      if (this.cloakingConfig.blocked_devices && this.cloakingConfig.blocked_devices.length > 0) {
        if (this.cloakingConfig.blocked_devices.includes(deviceCheck.type)) {
          shouldBlock = true;
          blockReason = 'Device not allowed';
        }
      }

      if (shouldBlock) {
        this.isBlocked = true;
        this._handleBlock(blockReason);
      } else {
        this._applyElementHiding();
      }

      this.cloakingActive = true;
    }

    _detectBot() {
      let score = 0;
      let isDefiniteBot = false;
      let isCrawler = false;
      const checks = [];

      const ua = navigator.userAgent;
      BOT_PATTERNS.userAgents.forEach(pattern => {
        if (pattern.test(ua)) {
          score += 2;
          isCrawler = true;
          checks.push('user_agent');
        }
      });

      BOT_PATTERNS.properties.forEach(prop => {
        if (window[prop] || navigator[prop]) {
          score += 3;
          isDefiniteBot = true;
          checks.push(`property_${prop}`);
        }
      });

      BOT_PATTERNS.windowProperties.forEach(prop => {
        if (window[prop]) {
          score += 3;
          isDefiniteBot = true;
          checks.push(`window_${prop}`);
        }
      });

      if (navigator.webdriver === true) {
        score += 3;
        isDefiniteBot = true;
        checks.push('webdriver');
      }

      if (!window.chrome && /Chrome/.test(ua)) {
        score += 1;
        checks.push('chrome_mismatch');
      }

      if (!navigator.languages || navigator.languages.length === 0) {
        score += 1;
        checks.push('no_languages');
      }

      if (navigator.plugins && navigator.plugins.length === 0 && !/Mobile|Android/i.test(ua)) {
        score += 1;
        checks.push('no_plugins');
      }

      if (!navigator.permissions) {
        score += 1;
        checks.push('no_permissions');
      }

      return {
        score,
        isDefiniteBot,
        isCrawler,
        checks
      };
    }

    _checkDevice() {
      const ua = navigator.userAgent;
      
      let type = 'desktop';
      if (DEVICE_DETECTION.mobile.test(ua)) {
        type = 'mobile';
      } else if (DEVICE_DETECTION.tablet.test(ua)) {
        type = 'tablet';
      }

      const isOldWindows = DEVICE_DETECTION.oldWindows.test(ua);

      return {
        type,
        isOldWindows,
        userAgent: ua
      };
    }

    async _checkGeolocation() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/geo-check`, {
          headers: {
            'X-Site-Key': this.siteKey
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('Geolocation check failed:', error);
      }
      
      return { country: null };
    }

    _handleBlock(reason) {
      console.warn('Access blocked:', reason);

      const fallbackUrl = this.cloakingConfig.fallback_page_url;
      
      if (fallbackUrl) {
        if (fallbackUrl.startsWith('http')) {
          window.location.href = fallbackUrl;
        } else {
          document.body.innerHTML = fallbackUrl;
        }
      } else {
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; padding: 2rem;">
            <div style="text-align: center; max-width: 500px;">
              <h1 style="font-size: 3rem; margin: 0;">🚫</h1>
              <h2 style="margin: 1rem 0;">Access Denied</h2>
              <p style="color: #666;">This website is protected by NEVA OFM AntiBot System.</p>
              <p style="color: #999; font-size: 0.875rem; margin-top: 2rem;">Reason: ${reason}</p>
            </div>
          </div>
        `;
      }
    }

    _applyElementHiding() {
      const selector = this.cloakingConfig.hide_elements_selector || '.bot-hide';
      
      const hideElements = () => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          el.setAttribute('data-antibot-hidden', 'true');
        });
      };

      hideElements();

      if (window.MutationObserver) {
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                if (node.matches && node.matches(selector)) {
                  node.style.display = 'none';
                  node.setAttribute('data-antibot-hidden', 'true');
                }
                const children = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                children.forEach(child => {
                  child.style.display = 'none';
                  child.setAttribute('data-antibot-hidden', 'true');
                });
              }
            });
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }

    _determineCaptchaProvider() {
      const { turnstile_site_key, hcaptcha_site_key } = this.siteConfig;
      
      if (this.config.captchaProvider === 'both') {
        if (turnstile_site_key && hcaptcha_site_key) {
          this.currentProvider = Math.random() < 0.5 ? 'turnstile' : 'hcaptcha';
        } else if (turnstile_site_key) {
          this.currentProvider = 'turnstile';
        } else if (hcaptcha_site_key) {
          this.currentProvider = 'hcaptcha';
        } else {
          throw new Error('No captcha provider configured');
        }
      } else if (this.config.captchaProvider === 'turnstile') {
        if (!turnstile_site_key) {
          throw new Error('Turnstile not configured for this site');
        }
        this.currentProvider = 'turnstile';
      } else if (this.config.captchaProvider === 'hcaptcha') {
        if (!hcaptcha_site_key) {
          throw new Error('hCaptcha not configured for this site');
        }
        this.currentProvider = 'hcaptcha';
      }
    }

    _loadCaptchaScript() {
      return new Promise((resolve, reject) => {
        const scriptUrl = CAPTCHA_SCRIPTS[this.currentProvider];
        
        if (this._isScriptLoaded(scriptUrl)) {
          this.captchaLoaded = true;
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          this.captchaLoaded = true;
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error(`Failed to load ${this.currentProvider} script`));
        };
        
        document.head.appendChild(script);
      });
    }

    _isScriptLoaded(url) {
      return Array.from(document.scripts).some(script => script.src === url);
    }

    _setupMouseTracking() {
      this._mouseMoveHandler = (e) => {
        const now = Date.now();
        this.mouseMovements.push({ x: e.clientX, y: e.clientY, time: now });
        
        if (this.mouseMovements.length > 50) {
          this.mouseMovements.shift();
        }
        
        this._analyzeMouseMovement();
      };
      
      window.addEventListener('mousemove', this._mouseMoveHandler);
    }

    _analyzeMouseMovement() {
      if (this.mouseMovements.length < 10) return;
      
      let straightLines = 0;
      let curves = 0;
      
      for (let i = 2; i < this.mouseMovements.length; i++) {
        const p1 = this.mouseMovements[i - 2];
        const p2 = this.mouseMovements[i - 1];
        const p3 = this.mouseMovements[i];
        
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        const angleDiff = Math.abs(angle1 - angle2);
        
        if (angleDiff < 0.1) {
          straightLines++;
        } else {
          curves++;
        }
      }
      
      this.isHumanLikely = curves > straightLines * 2;
    }

    _validateClick(event) {
      const checks = {
        isTrusted: event.isTrusted,
        hasMouseMovement: this.mouseMovements.length > 5,
        isHumanLike: this.isHumanLikely,
        hasHoverTime: this.buttonHoverTime && (Date.now() - this.buttonHoverTime) > 200,
        naturalSpeed: this.mouseMovements.length > 0 && 
                      this.mouseMovements[this.mouseMovements.length - 1].time - 
                      this.mouseMovements[0].time > 500
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      
      return {
        passed: passedChecks >= 3,
        checks,
        score: passedChecks
      };
    }

    _createDummyContainers(parentElement, realContainerId) {
      if (!this.config.randomContainers) return;

      const min = this.config.minDummyContainers;
      const max = this.config.maxDummyContainers;
      const numDummies = Math.floor(Math.random() * (max - min + 1)) + min;
      
      const allContainerIds = [];
      
      for (let i = 0; i < numDummies; i++) {
        const dummyId = `antibot-dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        allContainerIds.push(dummyId);
        
        const dummy = document.createElement('div');
        dummy.id = dummyId;
        dummy.className = 'antibot-container antibot-dummy';
        dummy.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden; opacity: 0; pointer-events: none;';
        dummy.setAttribute('aria-hidden', 'true');
        dummy.innerHTML = `<div style="display: none;"></div>`;
        
        parentElement.appendChild(dummy);
      }
      
      allContainerIds.push(realContainerId);
      
      for (let i = allContainerIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allContainerIds[i], allContainerIds[j]] = [allContainerIds[j], allContainerIds[i]];
      }
      
      allContainerIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          parentElement.appendChild(element);
        }
      });
    }

    _executePendingRenders() {
      while (this.pendingRenders.length > 0) {
        const { container, containerId } = this.pendingRenders.shift();
        if (container && document.body.contains(container)) {
          this._renderContent(container, containerId);
        }
      }
    }

    render(containerId) {
      if (this.isBlocked) {
        console.warn('Cannot render captcha: user is blocked');
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container element "${containerId}" not found`);
      }

      // Instant render mode
      if (!this.initialized && this.config.instantRender) {
        container.style.minHeight = '90px';
        container.style.position = 'relative';
        
        if (this.config.hideCaptcha) {
          this._renderInstantButton(container, containerId);
        } else {
          this._renderInstantLoader(container, containerId);
        }
        
        this.pendingRenders.push({ container, containerId });
        return;
      }

      if (this.initialized) {
        this._renderContent(container, containerId);
        return;
      }

      throw new Error('NEVA OFM SDK not initialized yet');
    }

    _renderInstantButton(container, containerId) {
      container.innerHTML = '';
      
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'antibot-show-captcha-btn';
      button.innerHTML = `
        <span class="antibot-btn-text">${this.config.buttonText}</span>
        <span class="antibot-btn-emoji">${this.config.buttonEmoji}</span>
      `;
      
      button.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        background: none;
        border: none;
        font-family: inherit;
        font-size: inherit;
        color: ${this.config.buttonColor};
        transition: opacity 0.2s;
      `;

      const emojiSpan = button.querySelector('.antibot-btn-emoji');
      if (emojiSpan && this.config.buttonEmojiAnimation) {
        emojiSpan.style.display = 'inline-block';
        emojiSpan.style.animation = 'antibot-poke 0.6s ease-in-out infinite';
      }

      const textSpan = button.querySelector('.antibot-btn-text');
      if (textSpan) {
        textSpan.style.textDecoration = 'underline';
      }
      
      button.addEventListener('mouseenter', () => {
        this.buttonHoverTime = Date.now();
        button.style.opacity = '0.7';
      });
      
      button.addEventListener('mouseleave', () => {
        this.buttonHoverTime = null;
        button.style.opacity = '1';
      });
      
      button.addEventListener('click', async (e) => {
        if (this.config.mouseTracking) {
          const validation = this._validateClick(e);
          this.clickAttempts++;
          
          if (!validation.passed) {
            if (this.clickAttempts >= 3) {
              alert('Bot behavior detected. Please refresh the page and try moving your mouse naturally.');
              return;
            }
            alert('Please move your mouse naturally before clicking.');
            return;
          }
        }
        
        button.remove();
        
        if (!this.initialized) {
          this._renderInstantLoader(container, containerId);
          await this._waitForInit();
        }
        
        this._renderCaptcha(container);
      });
      
      if (!document.querySelector('style[data-antibot-poke]')) {
        const style = document.createElement('style');
        style.setAttribute('data-antibot-poke', 'true');
        style.textContent = `
          @keyframes antibot-poke {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
          }
        `;
        document.head.appendChild(style);
      }
      
      container.appendChild(button);
    }

    _renderInstantLoader(container, containerId) {
      container.innerHTML = '';
      
      const loader = document.createElement('div');
      loader.className = 'antibot-instant-loader';
      loader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; opacity: 0.7; color: ${this.config.loaderTextColor};">
          <svg style="animation: antibot-spin 1s linear infinite; height: 1rem; width: 1rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Initializing security...</span>
        </div>
      `;
      
      if (!document.querySelector('style[data-antibot-spin]')) {
        const style = document.createElement('style');
        style.setAttribute('data-antibot-spin', 'true');
        style.textContent = '@keyframes antibot-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
      
      container.appendChild(loader);
    }

    _waitForInit() {
      return new Promise((resolve) => {
        if (this.initialized) {
          resolve();
          return;
        }
        
        const checkInit = setInterval(() => {
          if (this.initialized) {
            clearInterval(checkInit);
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInit);
          resolve();
        }, 30000);
      });
    }

    _renderContent(container, containerId) {
      while (container && container.firstChild) {
        try {
          container.removeChild(container.firstChild);
        } catch (e) {
          break;
        }
      }

      container.innerHTML = '';
      
      if (this.siteConfig && this.siteConfig.show_branding) {
        this._addBranding(container);
      }

      if (this.config.hideCaptcha) {
        this._renderHiddenMode(container);
      } else {
        this._renderCaptcha(container);
      }
    }

    _addBranding(container) {
      const branding = document.createElement('div');
      branding.className = 'antibot-branding';
      branding.innerHTML = `
        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #999; text-align: center;">
          Protected by <a href="https://neva-ofm.cc" target="_blank" style="color: #4F46E5; text-decoration: none;">NEVA OFM AntiBot</a>
        </div>
      `;
      container.appendChild(branding);
    }

    _renderHiddenMode(container) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'antibot-show-captcha-btn';
      button.innerHTML = `
        <span class="antibot-btn-text">${this.config.buttonText}</span>
        <span class="antibot-btn-emoji">${this.config.buttonEmoji}</span>
      `;
      
      button.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        background: none;
        border: none;
        font-family: inherit;
        font-size: inherit;
        color: ${this.config.buttonColor};
        transition: opacity 0.2s;
      `;

      const emojiSpan = button.querySelector('.antibot-btn-emoji');
      if (emojiSpan && this.config.buttonEmojiAnimation) {
        emojiSpan.style.display = 'inline-block';
        emojiSpan.style.animation = 'antibot-poke 0.6s ease-in-out infinite';
      }

      const textSpan = button.querySelector('.antibot-btn-text');
      if (textSpan) {
        textSpan.style.textDecoration = 'underline';
      }
      
      button.addEventListener('mouseenter', () => {
        this.buttonHoverTime = Date.now();
        button.style.opacity = '0.7';
      });
      
      button.addEventListener('mouseleave', () => {
        this.buttonHoverTime = null;
        button.style.opacity = '1';
      });
      
      button.addEventListener('click', (e) => {
        if (this.config.mouseTracking) {
          const validation = this._validateClick(e);
          this.clickAttempts++;
          
          if (!validation.passed) {
            if (this.clickAttempts >= 3) {
              alert('Bot behavior detected. Please refresh the page and try moving your mouse naturally.');
              return;
            }
            alert('Please move your mouse naturally before clicking.');
            return;
          }
        }
        
        button.remove();
        this._renderCaptcha(container);
      });
      
      container.insertBefore(button, container.firstChild);
    }

    _renderCaptcha(container) {
      this.realContainerId = `antibot-real-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const captchaDiv = document.createElement('div');
      captchaDiv.id = this.realContainerId;
      captchaDiv.className = 'antibot-container antibot-real';
      captchaDiv.style.position = 'absolute';
      captchaDiv.style.zIndex = '10';
      
      const loader = document.createElement('div');
      loader.className = 'antibot-loader';
      loader.style.cssText = 'z-index: 1;';
      loader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; opacity: 0.7; color: ${this.config.loaderTextColor};">
          <svg style="animation: antibot-spin 1s linear infinite; height: 1rem; width: 1rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading captcha...</span>
        </div>
      `;
      
      if (!document.querySelector('style[data-antibot-spin]')) {
        const style = document.createElement('style');
        style.setAttribute('data-antibot-spin', 'true');
        style.textContent = '@keyframes antibot-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }

      if (!document.querySelector('style[data-antibot-poke]')) {
        const style = document.createElement('style');
        style.setAttribute('data-antibot-poke', 'true');
        style.textContent = `
          @keyframes antibot-poke {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
          }
        `;
        document.head.appendChild(style);
      }
      
      container.insertBefore(loader, container.firstChild);
      container.insertBefore(captchaDiv, container.firstChild);

      this._createDummyContainers(container, this.realContainerId);

      if (this.currentProvider === 'turnstile') {
        this._renderTurnstile(this.realContainerId, loader);
      } else {
        this._renderHCaptcha(this.realContainerId, loader);
      }
    }

    _renderTurnstile(containerId, loader) {
      if (!window.turnstile) {
        console.error('Turnstile not loaded');
        if (loader) loader.remove();
        return;
      }

      try {
        this.widgetId = window.turnstile.render(`#${containerId}`, {
          sitekey: this.siteConfig.turnstile_site_key,
          theme: this.config.theme,
          size: this.config.size,
          callback: (token) => {
            if (loader) loader.remove();
            this.token = token;
            if (this.onSuccessCallback) {
              this.onSuccessCallback(token);
            }
          },
          'error-callback': () => {
            if (loader) loader.remove();
            const error = new Error('Turnstile verification failed');
            if (this.onErrorCallback) {
              this.onErrorCallback(error);
            }
          },
          'expired-callback': () => {
            this.token = null;
            if (this.onExpireCallback) {
              this.onExpireCallback();
            }
          }
        });
      } catch (error) {
        if (loader) loader.remove();
        console.error('Turnstile render error:', error);
      }
    }

    _renderHCaptcha(containerId, loader) {
      if (!window.hcaptcha) {
        console.error('hCaptcha not loaded');
        if (loader) loader.remove();
        return;
      }

      try {
        this.widgetId = window.hcaptcha.render(containerId, {
          sitekey: this.siteConfig.hcaptcha_site_key,
          theme: this.config.theme,
          size: this.config.size,
          callback: (token) => {
            if (loader) loader.remove();
            this.token = token;
            if (this.onSuccessCallback) {
              this.onSuccessCallback(token);
            }
          },
          'error-callback': () => {
            if (loader) loader.remove();
            const error = new Error('hCaptcha verification failed');
            if (this.onErrorCallback) {
              this.onErrorCallback(error);
            }
          },
          'expired-callback': () => {
            this.token = null;
            if (this.onExpireCallback) {
              this.onExpireCallback();
            }
          }
        });
      } catch (error) {
        if (loader) loader.remove();
        console.error('hCaptcha render error:', error);
      }
    }

    async verify() {
      if (!this.token) {
        throw new Error('No captcha token available. Please complete the captcha first.');
      }

      try {
        const response = await fetch(`${this.config.apiUrl}/api/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            site_key: this.siteKey,
            domain: window.location.hostname,
            captcha_token: this.token,
            captcha_provider: this.currentProvider
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Verification failed');
        }

        const data = await response.json();
        return data.token;
      } catch (error) {
        throw new Error(`Verification error: ${error.message}`);
      }
    }

    reset() {
      this.token = null;
      
      try {
        if (this.currentProvider === 'turnstile' && window.turnstile && this.widgetId !== null) {
          window.turnstile.reset(this.widgetId);
        } else if (this.currentProvider === 'hcaptcha' && window.hcaptcha && this.widgetId !== null) {
          window.hcaptcha.reset(this.widgetId);
        }
      } catch (error) {
        console.warn('Reset error:', error);
      }
    }

    destroy() {
      try {
        if (this.config.mouseTracking && this._mouseMoveHandler) {
          window.removeEventListener('mousemove', this._mouseMoveHandler);
        }

        this.reset();

        const containers = document.querySelectorAll('.antibot-container, .antibot-dummy, .antibot-instant-loader');
        containers.forEach(container => {
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        });

        const branding = document.querySelector('.antibot-branding');
        if (branding && branding.parentNode) {
          branding.parentNode.removeChild(branding);
        }

        const loader = document.querySelector('.antibot-loader');
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }

        this.widgetId = null;
        this.token = null;
        this.initialized = false;
        this.pendingRenders = [];
      } catch (error) {
        console.error('Destroy error:', error);
      }
    }

    getToken() {
      return this.token;
    }

    isUserBlocked() {
      return this.isBlocked;
    }

    isCloakingActive() {
      return this.cloakingActive;
    }

    isInitialized() {
      return this.initialized;
    }

    onSuccess(callback) {
      this.onSuccessCallback = callback;
      return this;
    }

    onError(callback) {
      this.onErrorCallback = callback;
      return this;
    }

    onExpire(callback) {
      this.onExpireCallback = callback;
      return this;
    }

    onInit(callback) {
      this.onInitCallback = callback;
      if (this.initialized) {
        callback();
      }
      return this;
    }
  }

  window.AntiBot = AntiBot;

})(window, document);