# NEVA OFM SDK

Advanced bot protection with captcha verification and intelligent cloaking system.

[![Version](https://img.shields.io/badge/version-1.0.5-blue.svg)](https://github.com/bikmeev/neva-ofm-sdk)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/github-bikmeev%2Fneva--ofm--sdk-black.svg)](https://github.com/bikmeev/neva-ofm-sdk)

## Table of Contents

### [Captcha Protection](#captcha-protection)
- [What is Captcha Protection?](#what-is-captcha-protection)
- [Quick Start - Captcha](#quick-start---captcha)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration Options](#configuration-options)
- [API Reference](#api-reference)
- [Backend Verification](#backend-verification)
- [Examples](#captcha-examples)

### [Cloaking Protection](#cloaking-protection)
- [What is Cloaking?](#what-is-cloaking)
- [Quick Start - Cloaking](#quick-start---cloaking)
- [How Cloaking Works](#how-cloaking-works)
- [Protection Modes](#protection-modes)
- [Hiding Content](#hiding-content-from-bots)
- [Dashboard Configuration](#dashboard-configuration)
- [Examples](#cloaking-examples)

### [Additional Resources](#additional-resources)
- [Combining Captcha + Cloaking](#combining-captcha--cloaking)
- [Troubleshooting](#troubleshooting)
- [Pricing](#pricing)
- [Support](#support)
- [Changelog](#changelog)

---

# Captcha Protection

## What is Captcha Protection?

NEVA OFM provides dual captcha support (Cloudflare Turnstile & hCaptcha) with intelligent bot detection features including:

- Behavioral analysis and fingerprinting
- Mouse movement tracking for human verification
- Random dummy containers for anti-automation
- Customizable UI with light/dark themes
- Secure backend verification with JWT tokens

**Use captcha when you need:**
- Form protection (login, registration, contact forms)
- API endpoint protection
- Action verification (purchases, submissions)

---

## Quick Start - Captcha

### 1. Include SDK

```html
<script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
```

### 2. Create Container

```html
<div id="antibot-container"></div>
```

### 3. Get Site Key

1. Register at [neva-ofm.cc](https://neva-ofm.cc)
2. Create a new site
3. Configure your captcha provider keys (Turnstile/hCaptcha)
4. Copy your site key (starts with `abs_`)

### 4. Configure Captcha Provider

**IMPORTANT:** Add `api.neva-ofm.cc` to your captcha provider's allowed domains:

**For Cloudflare Turnstile:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. Select your site
3. Add both `api.neva-ofm.cc` and your domain to "Domains"

**For hCaptcha:**
1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Go to Settings → Domains
3. Add both `api.neva-ofm.cc` and your domain

---

## Installation

No installation required! Just include the CDN script:

```html
<script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
```

---

## Basic Usage

### Simple Captcha

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <form id="myForm">
    <input type="email" placeholder="Email">
    
    <!-- Captcha will appear here -->
    <div id="antibot-container"></div>
    
    <button type="submit">Submit</button>
  </form>

  <script>
    // Initialize
    const antibot = new AntiBot('abs_your_site_key_here');
    
    // Render captcha
    antibot.render('antibot-container');
    
    // Handle success
    antibot.onSuccess(async (token) => {
      console.log('Captcha solved!', token);
      
      // Verify on backend
      const verifyToken = await antibot.verify();
      
      // Submit form
      document.getElementById('myForm').submit();
    });
    
    // Handle errors
    antibot.onError((error) => {
      console.error('Error:', error);
    });
  </script>
</body>
</html>
```

### Hidden Captcha Mode (Recommended)

```javascript
const antibot = new AntiBot('abs_your_site_key_here', {
  hideCaptcha: true,
  buttonText: 'Click to verify you are human',
  buttonEmoji: '🔒',
  mouseTracking: true
});

antibot.render('antibot-container');

antibot.onSuccess(async (token) => {
  const verifyToken = await antibot.verify();
  // Process verification...
});
```

[↑ Back to Top](#-table-of-contents)

---

## Configuration Options

```javascript
const antibot = new AntiBot('abs_your_site_key', {
  
  // Captcha Settings
  theme: 'light',                            // 'light' or 'dark'
  captchaProvider: 'both',                   // 'turnstile', 'hcaptcha', or 'both'
  size: 'normal',                            // 'normal' or 'compact'
  language: 'auto',                          // Language code or 'auto'
  
  // Hidden Mode (Recommended)
  hideCaptcha: true,                         // Hide captcha behind button
  buttonText: 'Press here to see captcha',  // Button text
  buttonEmoji: '👈',                         // Button emoji
  buttonColor: 'white',                      // Button text color
  buttonEmojiAnimation: true,                // Enable emoji animation
  
  // Protection Features
  mouseTracking: true,                       // Enable mouse movement analysis
  randomContainers: true,                    // Create dummy containers
  minDummyContainers: 2,                     // Minimum dummy containers
  maxDummyContainers: 5,                     // Maximum dummy containers
  
  // Performance
  instantRender: true,                       // Show UI immediately (v1.0.5)
  preloadBothProviders: false,               // Load both scripts in parallel
  loaderTextColor: 'white',                  // Loader text color
  
  // Advanced
  retryAttempts: 3,                          // Verification retry attempts
  timeout: 30000                             // Request timeout (ms)
});
```

[↑ Back to Top](#-table-of-contents)

---

## API Reference

### Constructor

#### `new AntiBot(siteKey, options)`

Creates a new AntiBot instance.

```javascript
const antibot = new AntiBot('abs_your_site_key_here', {
  theme: 'dark',
  hideCaptcha: true
});
```

---

### Methods

#### `render(containerId)`

Renders the captcha widget.

```javascript
antibot.render('antibot-container');
```

---

#### `verify()`

Verifies the captcha and returns JWT token.

```javascript
antibot.onSuccess(async (captchaToken) => {
  const jwtToken = await antibot.verify();
  console.log('JWT Token:', jwtToken);
});
```

---

#### `reset()`

Resets the captcha to initial state.

```javascript
antibot.reset();
```

---

#### `getToken()`

Returns current captcha token or null.

```javascript
const token = antibot.getToken();
```

---

#### `onSuccess(callback)`

Called when captcha is completed.

```javascript
antibot.onSuccess((token) => {
  console.log('Success!', token);
});
```

---

#### `onError(callback)`

Called when an error occurs.

```javascript
antibot.onError((error) => {
  console.error('Error:', error);
});
```

---

#### `onExpire(callback)`

Called when captcha token expires.

```javascript
antibot.onExpire(() => {
  console.log('Token expired');
  antibot.reset();
});
```

---

#### `onInit(callback)`

Called when SDK is fully initialized.

```javascript
antibot.onInit(() => {
  console.log('SDK ready!');
});
```

---

#### `isInitialized()`

Returns whether SDK is ready.

```javascript
if (antibot.isInitialized()) {
  antibot.render('antibot-container');
}
```

[↑ Back to Top](#-table-of-contents)

---

## Backend Verification

### Verification Endpoint

**POST** `https://api.neva-ofm.cc/api/siteverify`

**Request:**
```json
{
  "secret": "secret_your_secret_key",
  "token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "challenge_ts": "2025-01-15T10:30:00Z",
  "hostname": "example.com",
  "verified": true
}
```

### Node.js Example

```javascript
app.post('/api/submit', async (req, res) => {
  const { verifyToken } = req.body;
  
  const response = await fetch('https://api.neva-ofm.cc/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.NEVA_OFM_SECRET,
      token: verifyToken
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Invalid verification' });
  }
});
```

### PHP Example

```php
<?php
$verifyToken = $_POST['verifyToken'];

$response = file_get_contents('https://api.neva-ofm.cc/api/siteverify', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => 'Content-Type: application/json',
    'content' => json_encode([
      'secret' => getenv('NEVA_OFM_SECRET'),
      'token' => $verifyToken
    ])
  ]
]));

$result = json_decode($response, true);

if ($result['success']) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(403);
  echo json_encode(['error' => 'Invalid verification']);
}
?>
```

[↑ Back to Top](#-table-of-contents)

---

## Captcha Examples

### Complete Login Form

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <form id="loginForm">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    
    <div id="antibot-container"></div>
    
    <button type="submit">Login</button>
  </form>

  <script>
    const antibot = new AntiBot('abs_your_site_key_here', {
      theme: 'dark',
      hideCaptcha: true,
      buttonText: 'Verify you are human',
      buttonEmoji: '🔐',
      mouseTracking: true
    });

    antibot.render('antibot-container');

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const verifyToken = await antibot.verify();
        
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            verifyToken: verifyToken
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          window.location.href = '/dashboard';
        } else {
          alert('Login failed');
          antibot.reset();
        }
      } catch (error) {
        console.error(error);
        alert('Please complete the captcha');
      }
    });

    antibot.onSuccess(() => {
      console.log('Captcha completed!');
    });

    antibot.onError((error) => {
      console.error('Error:', error);
      alert('Verification failed. Please try again.');
    });

    antibot.onExpire(() => {
      antibot.reset();
    });
  </script>
</body>
</html>
```

### React/Next.js Integration

```jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function CaptchaForm() {
  const antibotRef = useRef(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.neva-ofm.cc/latest/neva-ofm.js';
    script.async = true;
    
    script.onload = () => {
      antibotRef.current = new window.AntiBot('abs_your_site_key_here', {
        theme: 'dark',
        hideCaptcha: true
      });
      
      antibotRef.current.render('antibot-container');
      
      antibotRef.current.onSuccess(() => {
        setVerified(true);
      });
    };
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verified) {
      alert('Please complete captcha');
      return;
    }
    
    const token = await antibotRef.current.verify();
    
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ verifyToken: token }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" />
      <div id="antibot-container"></div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

[↑ Back to Top](#-table-of-contents)

---

# Cloaking Protection

## What is Cloaking?

> **Premium Feature** - Available on paid plans (5 or 10 domains)

Cloaking is an advanced protection system that **automatically** detects and blocks bots, crawlers, and suspicious traffic **before they see your content**. No captcha needed!

It can use out antiRED protection and prevent domain beeing blocked.

**Perfect for:**
- Landing pages
- Affiliate offers
- Private content
- Preventing scrapers
- Blocking competitors

**The system analyzes:**
- User agent patterns and browser fingerprints
- WebDriver detection (Selenium, Puppeteer, etc.)
- Geographic location
- Device type (mobile, tablet, desktop)
- Operating system version
- Known crawler signatures

---

## Quick Start - Cloaking

### 1. Include SDK

```html
<script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
```

### 2. Initialize (No Container Needed!)

```html
<script>
  // Just initialize - no render() needed!
  const antibot = new AntiBot('abs_your_site_key_here');
  
  // Optional: Check if user is blocked
  if (antibot.isUserBlocked()) {
    console.log('User blocked by cloaking');
  }
</script>
```

### 3. Hide Content from Bots

Add `bot-hide` class to elements:

```html
<!-- Hide logo -->
<img src="/logo.png" class="bot-hide" alt="Logo">

<!-- Hide login form -->
<form class="bot-hide">
  <input type="email" placeholder="Email">
  <input type="password" placeholder="Password">
  <button type="submit">Login</button>
</form>

<!-- Hide contact info -->
<div class="bot-hide">
  <p>Email: contact@example.com</p>
  <p>Phone: +1234567890</p>
</div>
```

### 4. Configure in Dashboard

1. Go to [NEVA OFM Dashboard](https://neva-ofm.cc/dashboard)
2. Enable cloaking for your site
3. Choose protection mode (standard/moderate/aggressive)
4. Set blocked countries/devices (optional)
5. Configure fallback page

**That's it!** Cloaking works automatically. No `render()`, no containers, no callbacks needed.

[↑ Back to Top](#-table-of-contents)

---

## How Cloaking Works

### Automatic Bot Detection

When a user visits your page, NEVA OFM automatically:

1. **Analyzes the visitor** - Checks user agent, fingerprint, behavior
2. **Scores the traffic** - Assigns risk score based on detection rules
3. **Blocks if suspicious** - Shows fallback page to detected bots
4. **Hides content** - Elements with `.bot-hide` are invisible to bots
5. **Shows real content** - Legitimate users see everything normally

### Detection Methods

| Method | Description | Score Weight |
|--------|-------------|--------------|
| **WebDriver** | Detects Selenium, Puppeteer | High (3 points) |
| **User Agent** | Known bot patterns | Medium (2 points) |
| **Fingerprint** | Browser inconsistencies | Low (1 point) |
| **Geo Location** | Blocked countries | Instant block |
| **Old Windows** | XP, Vista, 7 | Instant block |
| **Crawler** | Google, Bing bots | Configurable |

---

## Protection Modes

Configure in your dashboard:

### Standard Mode (Recommended)

Blocks obvious bots and old Windows versions.

```
Blocks when:
- Definite bot detected (WebDriver, automation tools)
- Old Windows (XP, Vista, 7)
- Known crawlers (if enabled)
```

**Best for:** Most websites, balanced protection

---

### Moderate Mode

Stricter protection with scoring system.

```
Blocks when:
- Bot score ≥ 3 points
- Old Windows versions
- Blocked countries/devices
```

**Best for:** Sensitive content, higher security needs

---

### Aggressive Mode

Maximum protection, strictest rules.

```
Blocks when:
- Bot score ≥ 2 points
- Any suspicious indicator
- Old Windows versions
- Blocked countries/devices
```

**Best for:** High-value offers, maximum bot prevention

[↑ Back to Top](#-table-of-contents)

---

## Hiding Content from Bots

### Using `.bot-hide` Class (Default)

```html
<!-- Hide logo -->
<img src="/logo.png" class="bot-hide" alt="Logo">

<!-- Hide entire section -->
<section class="bot-hide">
  <h2>Premium Content</h2>
  <p>This is only visible to real users.</p>
</section>

<!-- Hide inline elements -->
<p>Public text <span class="bot-hide">secret info</span> more public text</p>
```

### Custom Selector

Configure in dashboard: `hide_elements_selector = ".protected"`

```html
<div class="protected">
  This content is hidden from bots
</div>

<!-- Or use data attributes -->
<!-- Dashboard: hide_elements_selector = "[data-bot-hide]" -->
<section data-bot-hide>
  Protected content here
</section>
```

### What to Hide

**Recommended to hide:**
- Logos and branding
- Login/registration forms
- Contact information (email, phone)
- Affiliate links
- Pricing information
- Download buttons
- API endpoints
- Admin panels

**Not recommended:**
- SEO-critical content
- Navigation menus
- Footer information
- Public blog posts

---

## Dashboard Configuration

### Settings Overview

| Setting | Description | Example |
|---------|-------------|---------|
| **Protection Mode** | standard/moderate/aggressive | `moderate` |
| **Blocked Countries** | ISO country codes to block | `US, RU, CN` |
| **Blocked Devices** | Device types to block | `mobile, tablet` |
| **Block Crawlers** | Block known search engines | `true/false` |
| **Hide Selector** | CSS selector for hidden elements | `.bot-hide` |
| **Fallback Page** | URL or HTML for blocked users | See below |

### Fallback Page Options

**Option 1: Redirect URL**
```
fallback_page_url = "https://example.com/safe-page"
```

**Option 2: Inline HTML**
```html
fallback_page_url = "
<div style='text-align:center; padding:50px;'>
  <h1>Welcome</h1>
  <p>Thanks for visiting!</p>
  <p>This page is protected.</p>
</div>
"
```

**Option 3: Default (No Fallback Set)**
- Shows generic "Access Denied" page
- Displays NEVA OFM branding

[↑ Back to Top](#-table-of-contents)

---

## Cloaking Examples

### Basic Landing Page Protection

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Landing Page</title>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <!-- Logo - hidden from bots -->
  <img src="/logo.png" class="bot-hide" alt="Logo">
  
  <!-- Main content - visible to all -->
  <h1>Welcome to Our Service</h1>
  <p>Public description goes here...</p>
  
  <!-- CTA - hidden from bots -->
  <div class="bot-hide">
    <button onclick="location.href='/signup'">Get Started</button>
    <p>Special Offer: 50% off!</p>
  </div>
  
  <!-- Contact - hidden from bots -->
  <footer class="bot-hide">
    <p>Email: support@example.com</p>
    <p>Phone: +1-234-567-8900</p>
  </footer>

  <script>
    // Initialize cloaking
    const antibot = new AntiBot('abs_your_site_key_here');
    
    // Optional: Check status
    console.log('Cloaking active:', antibot.isCloakingActive());
    console.log('User blocked:', antibot.isUserBlocked());
  </script>
</body>
</html>
```

### React/Next.js with Cloaking

```jsx
'use client';
import { useEffect, useState } from 'react';

export default function ProtectedPage() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [cloakingActive, setCloakingActive] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.neva-ofm.cc/latest/neva-ofm.js';
    script.async = true;
    
    script.onload = () => {
      const antibot = new window.AntiBot('abs_your_site_key_here');
      
      setIsBlocked(antibot.isUserBlocked());
      setCloakingActive(antibot.isCloakingActive());
    };
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (isBlocked) {
    return null; // Cloaking handles the blocking
  }

  return (
    <div>
      <h1>Protected Content</h1>
      
      {/* Hide sensitive content */}
      <div className="bot-hide">
        <p>Secret information only for real users</p>
        <button>Premium Action</button>
      </div>
      
      {cloakingActive && (
        <p>Advanced protection enabled</p>
      )}
    </div>
  );
}
```

[↑ Back to Top](#-table-of-contents)

---

# Additional Resources

## Combining Captcha + Cloaking

You can use both features together for maximum protection:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <!-- Logo hidden by cloaking -->
  <img src="/logo.png" class="bot-hide" alt="Logo">
  
  <!-- Login form hidden by cloaking -->
  <form id="loginForm" class="bot-hide">
    <input type="email" placeholder="Email">
    <input type="password" placeholder="Password">
    
    <!-- Captcha for additional verification -->
    <div id="antibot-container"></div>
    
    <button type="submit">Login</button>
  </form>

  <script>
    // Initialize with both cloaking and captcha
    const antibot = new AntiBot('abs_your_site_key_here', {
      hideCaptcha: true,
      mouseTracking: true
    });
    
    // Render captcha (cloaking works automatically)
    antibot.render('antibot-container');
    
    // Form submission with verification
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const verifyToken = await antibot.verify();
      
      // Submit to backend...
    });
  </script>
</body>
</html>
```

**Benefits of combining:**
- Cloaking blocks most bots automatically
- Captcha verifies legitimate users
- Maximum protection for critical actions
- Better user experience (most bots never see captcha)

[↑ Back to Top](#-table-of-contents)

---

## Troubleshooting

### "Domain not authorized" error

**Solution:**
- Check domain is added in NEVA OFM dashboard
- Verify you're using correct site key
- Ensure domain matches exactly (www/non-www)

---

### "Subscription expired" error

**Solution:**
- Check subscription status in dashboard
- Renew your plan if expired
- Free plan users: Cannot use cloaking features

---

### Captcha not loading

**Solution:**
- Check browser console for errors
- Verify Turnstile/hCaptcha keys are correct
- Ensure `api.neva-ofm.cc` is in captcha provider's allowed domains
- Check if ad blocker is interfering

---

### Elements not hiding with cloaking

**Solution:**
- Verify cloaking is enabled in dashboard
- Check you have a paid plan (cloaking is premium)
- Ensure elements have correct class (`.bot-hide`)
- Wait for SDK initialization to complete
- Check custom selector in dashboard settings

---

### Legitimate users being blocked

**Solution:**
- Lower protection mode (aggressive → moderate → standard)
- Check blocked countries list
- Disable crawler blocking if needed
- Review device blocking settings
- Check fallback page is working correctly

[↑ Back to Top](#-table-of-contents)

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | Basic captcha verification with branding |
| **5 Domains** | [Check Site](https://neva-ofm.cc) | Сaptcha without branding<br>Cloaking features<br>5 domains<br>BlackTLDs protection |
| **10 Domains** | [Check Site](https://neva-ofm.cc) | Captcha without branding<br>Cloaking features<br>10 domains<br>BlackTLDs protection |

Visit [neva-ofm.cc](https://neva-ofm.cc) for current pricing.

[↑ Back to Top](#-table-of-contents)

---

## Support

Need help? Contact our team:

- **Raise support ticket** in [NEVA OFM Dashboard](https://neva-ofm.cc/dashboard)
- **Telegram:** [@manager_shurik](https://t.me/manager_shurik)
- **Documentation:** [docs.neva-ofm.cc](https://docs.neva-ofm.cc)
- **Issues:** [GitHub Issues](https://github.com/bikmeev/neva-ofm-sdk/issues)

[↑ Back to Top](#-table-of-contents)

---

## Changelog

### Version 1.0.5 (Current) - 2025-11-13

**Performance Improvements:**
- **Instant Rendering** - UI appears immediately, no empty container delay
- **Parallel Initialization** - Config and captcha scripts load simultaneously
- **Optimistic Rendering** - Button/loader shows instantly while SDK initializes
- **Preload Both Providers** - Option to load Turnstile and hCaptcha in parallel

**New Features:**
- Added `instantRender` option (default: true) for immediate UI display
- Added `preloadBothProviders` option for parallel script loading
- Added `loaderTextColor` option to customize loader text color
- New `onInit(callback)` method to detect when SDK is fully ready
- New `isInitialized()` method to check initialization status
- Pending render queue system for deferred initialization

**Technical Improvements:**
- Optimized initialization flow with Promise.all for parallel tasks
- Better handling of render() calls before SDK is ready
- Improved user experience with zero-delay UI rendering
- Enhanced memory management with pending renders cleanup

---

### Version 1.0.4 - 2025-11-13

**Bug Fixes:**
- Fixed critical DOM manipulation error causing "removeChild" runtime exceptions
- Resolved memory leaks from event listeners not being properly cleaned up
- Fixed issue where captcha containers were not safely removed on component unmount

**Improvements:**
- Added `destroy()` method for proper cleanup of SDK instances
- Implemented safe DOM element removal with parent node validation
- Enhanced `reset()` method with error handling to prevent crashes
- Improved `_renderContent()` to safely clear containers before rendering
- Added proper event listener cleanup in `_setupMouseTracking()`
- Better handling of edge cases when SDK is destroyed during initialization

---

### Version 1.0.3 - 2025-11-12

**Improvements:**
- Fixed captcha styling issues
- Improved visual consistency across different themes
- Enhanced CSS compatibility with various frameworks
- Better responsive design for mobile devices

---

### Version 1.0.2 - 2025-11-11

**Improvements:**
- Performance optimization during captcha initialization
- Added loading indicator while captcha is being initialized
- Improved user feedback during SDK loading
- Better handling of slow network connections

---

### Version 1.0.1 - 2025-11-10

**Initial Release:**
- Basic captcha verification with Cloudflare Turnstile and hCaptcha support
- Intelligent bot detection with behavioral analysis
- Advanced cloaking system for premium users
- Mouse movement tracking for human verification
- Random dummy containers to prevent automation
- Geographic and device-based blocking
- Crawler detection and blocking
- Customizable UI with light/dark themes
- Hidden captcha mode
- Secure backend verification with JWT tokens
- Complete API with callbacks for success, error, and expiration events

[↑ Back to Top](#-table-of-contents)

---

## Best Practices

### Security

- Always verify tokens on your backend server
- Never trust client-side verification alone
- Store secret keys securely (environment variables)
- Use HTTPS in production
- Add rate limiting to verification endpoint
- Log verification failures for monitoring
- Hide sensitive content using `.bot-hide` class
- Regularly rotate your API keys
- Monitor dashboard for suspicious activity

### Performance

- Enable `instantRender: true` for zero-delay UI (default in v1.0.5)
- Use `preloadBothProviders: true` for fastest first captcha load
- Load SDK asynchronously to avoid blocking page render
- Use `onInit()` callback to detect when SDK is fully ready
- Enable `randomContainers` for anti-automation
- Cache verification results on backend (with short TTL)

### User Experience

- Use `hideCaptcha: true` for better UX (recommended)
- Provide clear instructions for users
- Use appropriate theme (light/dark) for your design
- Show loading indicators during verification
- Handle errors gracefully with user-friendly messages
- Auto-reset captcha on expiration
- Test on multiple devices and browsers

### Cloaking Best Practices

- Start with Standard mode, increase if needed
- Hide logos, forms, and contact info from bots
- Create meaningful fallback pages
- Monitor blocked traffic in dashboard
- Don't block legitimate search engines (unless needed)
- Test your configuration with different devices
- Keep SEO-critical content visible

[↑ Back to Top](#-table-of-contents)

---

## Quick Reference

### Captcha-Only Setup

```javascript
// Minimal setup
const antibot = new AntiBot('abs_your_site_key');
antibot.render('antibot-container');
antibot.onSuccess(async (token) => {
  const jwt = await antibot.verify();
  // Process...
});
```

### Cloaking-Only Setup

```html
<!-- No container needed! -->
<div class="bot-hide">Protected content</div>
<script>
  new AntiBot('abs_your_site_key');
</script>
```

### Both Features

```javascript
const antibot = new AntiBot('abs_your_site_key', {
  hideCaptcha: true
});
antibot.render('antibot-container');
// Cloaking works automatically + captcha verification
```

[↑ Back to Top](#-table-of-contents)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- **Website:** [neva-ofm.cc](https://neva-ofm.cc)
- **Documentation:** [docs.neva-ofm.cc](https://docs.neva-ofm.cc)
- **GitHub:** [github.com/bikmeev/neva-ofm-sdk](https://github.com/bikmeev/neva-ofm-sdk)
- **CDN:** [cdn.neva-ofm.cc](https://cdn.neva-ofm.cc)

---

## Support Our Project

If you find NEVA OFM SDK helpful, consider supporting our development:

<a href="https://nowpayments.io/donation?api_key=d5835015-743c-479c-86ce-df1d9fc2eb07" target="_blank">
    <img src="https://nowpayments.io/images/embeds/donation-button-white.svg" alt="Crypto donation by NOWPayments">
</a>

Your support helps us maintain and improve the SDK. Thank you!

---

**Made by NEVA OFM Team**

[↑ Back to Top](#-table-of-contents)