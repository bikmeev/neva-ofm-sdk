# NEVA OFM SDK

Advanced bot protection with captcha verification and intelligent cloaking system.

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://github.com/bikmeev/neva-ofm-sdk)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/github-bikmeev%2Fneva--ofm--sdk-black.svg)](https://github.com/bikmeev/neva-ofm-sdk)

## Features

- **Dual Captcha Support** - Cloudflare Turnstile & hCaptcha
- **Intelligent Bot Detection** - Behavioral analysis and fingerprinting
- **Advanced Cloaking System** - Hide content from bots (premium feature)
- **BlackTLDs** - Protect from registrator checks for ex. to prevent domain beeng blocked (premium feature)
- **Mouse Movement Tracking** - Human verification
- **Random Dummy Containers** - Anti-automation protection
- **Geographic Blocking** - Country-based restrictions
- **Device Detection** - Block specific device types
- **Crawler Detection** - Identify and block web crawlers
- **Customizable UI** - Light/dark themes and hidden mode
- **Secure Backend Verification** - JWT token validation

## Installation

### Step 1: Include the SDK

Add the SDK script to your HTML page:

```html
<script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
```

### Step 2: Create Container

Add a container element where the captcha will be rendered:

```html
<div id="antibot-container"></div>
```

### Step 3: Get Your Site Key

1. Register at [neva-ofm.cc](https://neva-ofm.cc)
2. Create a new site and configure your captcha provider keys
3. Copy your site key (starts with `abs_`)

### Step 4: Configure Captcha Provider

**IMPORTANT:** You must add `api.neva-ofm.cc` to your allowed domains in your captcha provider dashboard.

#### For Cloudflare Turnstile:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. Select your site
3. Add both `api.neva-ofm.cc` and your own domain to "Domains"

#### For hCaptcha:
1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Go to Settings → Domains
3. Add both `api.neva-ofm.cc` and your own domain

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <div id="antibot-container"></div>

  <script>
    // Initialize AntiBot
    const antibot = new AntiBot('abs_your_site_key_here');
    
    // Render captcha
    antibot.render('antibot-container');
    
    // Handle successful verification
    antibot.onSuccess(async (token) => {
      console.log('Captcha solved!', token);
      
      // Verify on backend
      const verifyToken = await antibot.verify();
      console.log('Verification token:', verifyToken);
      
      // Submit your form or perform protected action
      document.getElementById('myForm').submit();
    });
    
    // Handle errors
    antibot.onError((error) => {
      console.error('AntiBot error:', error);
    });
  </script>
</body>
</html>
```

### Hidden Captcha Mode

Hide the captcha behind a button with mouse tracking:

```javascript
const antibot = new AntiBot('abs_your_site_key_here', {
  hideCaptcha: true,
  buttonText: 'Click here to verify',
  buttonEmoji: '🔒',
  mouseTracking: true
});

antibot.render('antibot-container');

antibot.onSuccess(async (token) => {
  const verifyToken = await antibot.verify();
  // Process verification...
});
```

## Configuration Options

```javascript
const antibot = new AntiBot('abs_your_site_key', {
  
  // Captcha Settings
  theme: 'light',                            // 'light' or 'dark'
  captchaProvider: 'both',                   // 'turnstile', 'hcaptcha', or 'both'
  size: 'normal',                            // 'normal' or 'compact'
  language: 'auto',                          // Language code or 'auto'
  
  // Hidden Mode
  hideCaptcha: false,                        // Hide captcha behind button
  buttonText: 'Press here to see captcha',  // Button text
  buttonEmoji: '👈',                         // Button emoji
  
  // Protection Features
  mouseTracking: true,                       // Enable mouse movement analysis
  randomContainers: true,                    // Create dummy containers
  minDummyContainers: 2,                     // Minimum dummy containers
  maxDummyContainers: 5,                     // Maximum dummy containers
  
  // Advanced
  retryAttempts: 3,                          // Verification retry attempts
  timeout: 30000                             // Request timeout (ms)
});
```

## API Reference

### Constructor

#### `new AntiBot(siteKey, options)`

Creates a new AntiBot instance and initializes the protection system.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siteKey` | string | Yes | Your site key from NEVA OFM dashboard (starts with `abs_`) |
| `options` | object | No | Configuration options object |

**Options Object:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | `'light'` | Captcha theme: `'light'` or `'dark'` |
| `captchaProvider` | string | `'both'` | Provider selection: `'turnstile'`, `'hcaptcha'`, or `'both'` (random) |
| `size` | string | `'normal'` | Captcha size: `'normal'` or `'compact'` |
| `language` | string | `'auto'` | Language code (e.g., `'en'`, `'ru'`) or `'auto'` |
| `hideCaptcha` | boolean | `true` | Hide captcha behind a button (reccomended true)|
| `buttonText` | string | `'Press here to see captcha'` | Button text when `hideCaptcha: true` |
| `buttonEmoji` | string | `'👈'` | Emoji displayed on button |
| `buttonColor` | string | `'white'` | Button text color (CSS color value) |
| `buttonEmojiAnimation` | boolean | `true` | Enable poke animation for button emoji |
| `mouseTracking` | boolean | `true` | Enable mouse movement analysis for bot detection |
| `randomContainers` | boolean | `true` | Create random dummy containers to confuse automation (reccomended true) |
| `minDummyContainers` | number | `2` | Minimum number of dummy containers |
| `maxDummyContainers` | number | `5` | Maximum number of dummy containers |
| `retryAttempts` | number | `3` | Number of retry attempts for failed requests |
| `timeout` | number | `30000` | Request timeout in milliseconds |

**Example:**

```javascript
// Basic initialization
const antibot = new AntiBot('abs_your_site_key_here');

// With options
const antibot = new AntiBot('abs_your_site_key_here', {
  theme: 'dark',
  hideCaptcha: true,
  buttonText: 'Verify you are human',
  buttonEmoji: '🔐',
  buttonColor: '#ffffff',
  mouseTracking: true,
  captchaProvider: 'turnstile'
});
```

**Throws:**
- `Error` - If siteKey is not provided
- `Error` - If no captcha provider is configured
- `Error` - If domain is not authorized

---

### Methods

#### `render(containerId)`

Renders the captcha widget in the specified container element.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `containerId` | string | Yes | ID of the HTML element where captcha will be rendered |

**Returns:** `void`

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');

// Render in container with ID "antibot-container"
antibot.render('antibot-container');
```

**HTML:**
```html
<div id="antibot-container"></div>
```

**Throws:**
- `Error` - If SDK is not initialized yet
- `Error` - If container element is not found
- Logs warning if user is blocked by cloaking

---

#### `verify()`

Verifies the captcha token on the backend and returns a JWT token for your server-side verification.

**Parameters:** None

**Returns:** `Promise<string>` - JWT verification token

**Example:**

```javascript
antibot.onSuccess(async (captchaToken) => {
  try {
    // Verify and get JWT token
    const jwtToken = await antibot.verify();
    
    console.log('JWT Token:', jwtToken);
    
    // Send to your backend
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        verifyToken: jwtToken,
        // ... other form data
      })
    });
    
    const result = await response.json();
    console.log('Backend response:', result);
  } catch (error) {
    console.error('Verification failed:', error);
  }
});
```

**Throws:**
- `Error` - If no captcha token is available (captcha not completed)
- `Error` - If verification request fails
- `Error` - If backend returns an error

---

#### `reset()`

Resets the captcha widget to its initial state. Clears the current token and reloads the captcha challenge.

**Parameters:** None

**Returns:** `void`

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');
antibot.render('antibot-container');

// Reset after form submission error
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const token = await antibot.verify();
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ verifyToken: token })
    });
    
    if (!response.ok) {
      throw new Error('Submission failed');
    }
  } catch (error) {
    console.error('Error:', error);
    // Reset captcha on error
    antibot.reset();
    alert('Please try again');
  }
});

// Auto-reset on token expiration
antibot.onExpire(() => {
  antibot.reset();
});
```

---

#### `getToken()`

Returns the current captcha token without verification. Returns `null` if captcha has not been completed yet.

**Parameters:** None

**Returns:** `string | null` - Current captcha token or null

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');
antibot.render('antibot-container');

antibot.onSuccess((token) => {
  // Get token directly
  const currentToken = antibot.getToken();
  console.log('Token:', currentToken);
  
  // Check if token exists before form submission
  const submitButton = document.getElementById('submitBtn');
  submitButton.disabled = !currentToken;
});

// Check token on form submit
document.getElementById('myForm').addEventListener('submit', (e) => {
  const token = antibot.getToken();
  
  if (!token) {
    e.preventDefault();
    alert('Please complete the captcha first');
  }
});
```

---

#### `isUserBlocked()`

Returns whether the current user is blocked by the cloaking system.

**Parameters:** None

**Returns:** `boolean` - `true` if user is blocked, `false` otherwise

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');

// Check if user is blocked
if (antibot.isUserBlocked()) {
  console.log('User is blocked by cloaking system');
  // User will see fallback page automatically
} else {
  console.log('User is allowed');
  antibot.render('antibot-container');
}

// You can also check this after initialization
setTimeout(() => {
  if (!antibot.isUserBlocked()) {
    // Show additional content
    document.getElementById('content').style.display = 'block';
  }
}, 1000);
```

---

#### `isCloakingActive()`

Returns whether the cloaking protection system is active for this site.

**Parameters:** None

**Returns:** `boolean` - `true` if cloaking is active, `false` otherwise

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');

// Check if cloaking is active
if (antibot.isCloakingActive()) {
  console.log('Advanced protection is enabled');
  // Elements with .bot-hide class are being hidden
} else {
  console.log('Basic captcha verification only');
}
```

---

#### `onSuccess(callback)`

Registers a callback function that will be called when the captcha is successfully completed by the user.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callback` | function | Yes | Callback function that receives the captcha token |

**Callback Parameters:**
- `token` (string) - The captcha token returned by the provider (Turnstile or hCaptcha)

**Returns:** `this` (for method chaining)

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');
antibot.render('antibot-container');

// Register success handler
antibot.onSuccess(async (captchaToken) => {
  console.log('Captcha completed!');
  console.log('Captcha Token:', captchaToken);
  
  // Show success message
  document.getElementById('status').textContent = 'Verifying...';
  
  try {
    // Verify on backend
    const jwtToken = await antibot.verify();
    
    // Submit form
    const formData = new FormData(document.getElementById('myForm'));
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verifyToken: jwtToken,
        ...Object.fromEntries(formData)
      })
    });
    
    if (response.ok) {
      document.getElementById('status').textContent = 'Success!';
      window.location.href = '/success';
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    document.getElementById('status').textContent = 'Error';
    console.error(error);
  }
});

// Method chaining
antibot
  .onSuccess((token) => console.log('Success:', token))
  .onError((error) => console.error('Error:', error))
  .onExpire(() => console.log('Expired'));
```

---

#### `onError(callback)`

Registers a callback function that will be called when an error occurs during captcha rendering or verification.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callback` | function | Yes | Callback function that receives the error object |

**Callback Parameters:**
- `error` (Error) - The error object with details about what went wrong

**Returns:** `this` (for method chaining)

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');
antibot.render('antibot-container');

// Register error handler
antibot.onError((error) => {
  console.error('AntiBot Error:', error);
  
  // Show user-friendly message
  const errorDiv = document.getElementById('error-message');
  errorDiv.style.display = 'block';
  errorDiv.textContent = 'Verification failed. Please refresh and try again.';
  
  // Log to monitoring service
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  });
  
  // Hide loading indicator
  document.getElementById('loading').style.display = 'none';
  
  // Enable retry button
  document.getElementById('retryBtn').style.display = 'block';
});

// Retry functionality
document.getElementById('retryBtn').addEventListener('click', () => {
  antibot.reset();
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('retryBtn').style.display = 'none';
});
```

**Common Errors:**
- `"No captcha token available"` - User hasn't completed captcha
- `"Failed to load [provider] script"` - Captcha provider script couldn't load
- `"Domain not authorized"` - Domain not added in dashboard
- `"Verification failed"` - Backend verification rejected the token

---

#### `onExpire(callback)`

Registers a callback function that will be called when the captcha token expires. Captcha tokens typically expire after a few minutes.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callback` | function | Yes | Callback function called on token expiration |

**Callback Parameters:** None

**Returns:** `this` (for method chaining)

**Example:**

```javascript
const antibot = new AntiBot('abs_your_site_key_here');
antibot.render('antibot-container');

// Register expiration handler
antibot.onExpire(() => {
  console.log('Captcha token expired');
  
  // Auto-reset captcha
  antibot.reset();
  
  // Notify user
  const notification = document.createElement('div');
  notification.className = 'notification warning';
  notification.textContent = 'Verification expired. Please complete the captcha again.';
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => notification.remove(), 5000);
  
  // Disable submit button until re-verified
  document.getElementById('submitBtn').disabled = true;
});

// Re-enable submit button on success
antibot.onSuccess(() => {
  document.getElementById('submitBtn').disabled = false;
});
```

**Best Practices:**
- Always reset the captcha on expiration
- Notify users that they need to verify again
- Disable form submission until re-verified
- Consider implementing auto-refresh if user is still on the page

---

## Cloaking & Advanced Protection

> **Note:** Cloaking features are only available on paid plans (5 domains or 10 domains). Configure settings in your NEVA OFM dashboard.

### What is our Cloaking?

Cloaking is an advanced protection system that detects and blocks bots, crawlers, and suspicious traffic before they see your content. The system analyzes:

- User agent patterns and browser fingerprints
- WebDriver detection (Selenium, Puppeteer, etc.)
- Geographic location
- Device type (mobile, tablet, desktop)
- Operating system version
- Known crawler signatures

### Protection Modes

Configure the protection mode in your dashboard:

- **Standard Mode** - Blocks obvious bots and old Windows versions (XP, Vista, 7)
- **Moderate Mode** - Blocks suspicious traffic with 3+ bot indicators
- **Aggressive Mode** - Blocks traffic with 2+ bot indicators (strictest)

### Hide Elements from Bots

Add the `bot-hide` class to elements you want to hide from bots:

```html
<!-- Hide logo from bots -->
<img src="/logo.png" class="bot-hide" alt="Logo">

<!-- Hide login form from bots -->
<form class="bot-hide" id="loginForm">
  <input type="email" name="email" placeholder="Email">
  <input type="password" name="password" placeholder="Password">
  <button type="submit">Login</button>
</form>

<!-- Hide contact information -->
<div class="bot-hide">
  <p>Email: contact@example.com</p>
  <p>Phone: +1234567890</p>
</div>
```

> **Recommended:** Hide logos, login forms, contact information, and any sensitive content from bots to prevent automated attacks and scraping.

### Custom Selector

Configure a custom CSS selector in your dashboard:

```html
<!-- Dashboard setting: hide_elements_selector = ".protected" -->
<div class="protected">
  This content is hidden from bots
</div>

<!-- Or use data attributes -->
<!-- Dashboard setting: hide_elements_selector = "[data-bot-hide]" -->
<section data-bot-hide>
  Protected content here
</section>
```

### Dashboard Configuration

Configure cloaking settings in your NEVA OFM dashboard:

- **Protection Mode** - Choose standard, moderate, or aggressive
- **Blocked Countries** - List of country codes to block (e.g., US, RU, CN)
- **Blocked Devices** - Select mobile, tablet, or desktop
- **Block Crawlers** - Enable/disable crawler blocking
- **Fallback Page** - URL or HTML content to show blocked users
- **Hide Selector** - CSS selector for elements to hide (default: `.bot-hide`)

### Fallback Page

Create a safe landing page for blocked visitors:

```html
<!-- Option 1: Redirect to another URL -->
<!-- Dashboard setting: fallback_page_url = "https://example.com/safe-page" -->

<!-- Option 2: Inline HTML content -->
<!-- Dashboard setting: fallback_page_url = "<div style='text-align:center; padding:50px;'>
  <h1>Welcome</h1>
  <p>This is a safe landing page.</p>
</div>" -->
```

## Backend Verification

Always verify tokens on your backend server for security.

### Verification Endpoint

**POST** `https://api.neva-ofm.cc/api/siteverify`

**Request:**
```json
{
  "secret": "secret_your_secret_key_from_neva_ofm_dashboard",
  "token": "eyJhbGc..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "challenge_ts": "2025-01-15T10:30:00Z",
  "hostname": "example.com",
  "verified": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "error-codes": ["invalid-input-response"]
}
```

### Node.js / Express Example

```javascript
app.post('/api/submit', async (req, res) => {
  const { verifyToken } = req.body;
  
  const response = await fetch('https://api.neva-ofm.cc/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.NEVA_OFM_SECRET,  // From dashboard
      token: verifyToken
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Token is valid - process request
    res.json({ success: true });
  } else {
    // Token is invalid - reject request
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
  // Token is valid
  echo json_encode(['success' => true]);
} else {
  // Token is invalid
  http_response_code(403);
  echo json_encode(['error' => 'Invalid verification']);
}
?>
```

## Advanced Examples

### Complete Example with All Features

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Protected Form</title>
  <script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
</head>
<body>
  <!-- Logo - hidden from bots -->
  <img src="/logo.png" class="bot-hide" alt="Logo">
  
  <!-- Login form - hidden from bots -->
  <form id="loginForm" class="bot-hide">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    
    <!-- Captcha container -->
    <div id="antibot-container"></div>
    
    <button type="submit">Login</button>
  </form>

  <script>
    // Initialize with custom settings
    const antibot = new AntiBot('abs_your_site_key_here', {
      theme: 'dark',
      hideCaptcha: true,
      buttonText: 'Verify you are human',
      buttonEmoji: '🔐',
      mouseTracking: true,
      randomContainers: true,
      captchaProvider: 'both'
    });

    // Render captcha
    antibot.render('antibot-container');

    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        // Verify captcha
        const verifyToken = await antibot.verify();
        
        // Submit to backend
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
          alert('Login failed: ' + result.error);
          antibot.reset();
        }
      } catch (error) {
        console.error('Verification error:', error);
        alert('Please complete the captcha');
      }
    });

    // Handle success
    antibot.onSuccess((token) => {
      console.log('Captcha completed!');
    });

    // Handle errors
    antibot.onError((error) => {
      console.error('AntiBot error:', error);
      alert('Verification failed. Please try again.');
    });

    // Handle expiration
    antibot.onExpire(() => {
      console.log('Token expired, resetting...');
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

export default function ProtectedForm() {
  const antibotRef = useRef(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Load SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.neva-ofm.cc/latest/neva-ofm.js';
    script.async = true;
    script.onload = () => {
      // Initialize AntiBot
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
    
    try {
      const token = await antibotRef.current.verify();
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ verifyToken: token }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bot-hide">
      <input type="email" placeholder="Email" />
      <div id="antibot-container"></div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Multiple Captchas on Same Page

```javascript
// Login form captcha
const loginAntibot = new AntiBot('abs_your_site_key_here');
loginAntibot.render('login-captcha');

// Register form captcha
const registerAntibot = new AntiBot('abs_your_site_key_here');
registerAntibot.render('register-captcha');

// Login submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = await loginAntibot.verify();
  // Submit with token...
});

// Register submit
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = await registerAntibot.verify();
  // Submit with token...
});
```

### Error Handling

```javascript
const antibot = new AntiBot('abs_your_site_key_here');

antibot.onError((error) => {
  // Log error for debugging
  console.error('AntiBot Error:', error);
  
  // Show user-friendly message
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = 'Verification failed. Please refresh and try again.';
  errorDiv.style.display = 'block';
  
  // Optional: Send error to monitoring service
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({ 
      error: error.message, 
      timestamp: new Date() 
    })
  });
});

antibot.onExpire(() => {
  // Auto-reset on expiration
  antibot.reset();
  
  // Notify user
  alert('Verification expired. Please complete the captcha again.');
});

// Verify with timeout
async function verifyWithTimeout(timeoutMs = 30000) {
  return Promise.race([
    antibot.verify(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification timeout')), timeoutMs)
    )
  ]);
}

// Usage
try {
  const token = await verifyWithTimeout(30000);
  console.log('Verified:', token);
} catch (error) {
  console.error('Verification failed:', error);
}
```

## Best Practices

### Security

- Always verify tokens on your backend server
- Never trust client-side verification alone
- Store secret keys securely (environment variables)
- Use HTTPS in production
- Add rate limiting to your verification endpoint
- Log verification failures for security monitoring
- Hide sensitive content using `.bot-hide` class
- Regularly rotate your API keys
- Monitor your dashboard for suspicious activity

### Performance

- Load SDK asynchronously to avoid blocking page render
- Use `hideCaptcha: true` for better user experience
- Enable `randomContainers` for anti-automation
- Cache verification results on backend (with short TTL)
- Use CDN for faster SDK delivery
- Monitor API response times in your dashboard

### User Experience

- Provide clear instructions for users
- Use appropriate theme (light/dark) for your design
- Show loading indicators during verification
- Handle errors gracefully with user-friendly messages
- Auto-reset captcha on expiration
- Test on multiple devices and browsers

## Troubleshooting

### "Domain not authorized" error

**Solution:**
- Check your domain is added in NEVA OFM dashboard
- Verify you're using the correct site key
- Ensure domain matches exactly (including www/non-www)

### "Subscription expired" error

**Solution:**
- Check your subscription status in dashboard
- Renew your plan if expired
- Free plan users: Ensure you're not using cloaking features

### Captcha not loading

**Solution:**
- Check browser console for errors
- Verify Turnstile/hCaptcha keys are correct
- Ensure `api.neva-ofm.cc` is in allowed domains for captcha provider
- Check if ad blocker is interfering

### Elements not hiding with cloaking

**Solution:**
- Verify cloaking is enabled in dashboard
- Check you have a paid plan
- Ensure elements have correct class (`.bot-hide`)
- Wait for SDK initialization to complete

## Pricing

- **Free Plan** - Basic captcha verification with branding
- **5 Domains Plan** - Captcha verification without branding and Cloaking features + 5 domains
- **10 Domains Plan** - Captcha verification without branding and Cloaking features + 10 domains

Visit [neva-ofm.cc](https://neva-ofm.cc) for current pricing and features.

## Support

Need help? Contact our support team:

- Raise ticket in NEVA OFM Dashboard: [neva-ofm.cc/dashboard](https://neva-ofm.cc/dashboard)
- Telegram: [@manager_shurik](https://t.me/manager_shurik)
- Documentation: [docs.neva-ofm.cc](https://docs.neva-ofm.cc)
- Issues: [GitHub Issues](https://github.com/bikmeev/neva-ofm-sdk/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- Website: [neva-ofm.cc](https://neva-ofm.cc)
- Documentation: [docs.neva-ofm.cc](https://docs.neva-ofm.cc)
- GitHub: [github.com/bikmeev/neva-ofm-sdk](https://github.com/bikmeev/neva-ofm-sdk)
- CDN: [cdn.neva-ofm.cc](https://cdn.neva-ofm.cc)

---

Made by NEVA OFM Team

## Support Our Project

If you find NEVA OFM SDK helpful, consider supporting our development with cryptocurrency:

<a href="https://nowpayments.io/donation?api_key=d5835015-743c-479c-86ce-df1d9fc2eb07" target="_blank" rel="noreferrer noopener">
    <img src="https://nowpayments.io/images/embeds/donation-button-white.svg" alt="Cryptocurrency & Bitcoin donation button by NOWPayments">
</a>

Your support helps us maintain and improve the SDK. Thank you!

## Change Log

### Version 1.0.3 (Current)
**Release Date:** 2025-11-12
**Bug Fixes:**
- Fixed critical DOM manipulation error causing "removeChild" runtime exceptions
- Resolved memory leaks from event listeners not being properly cleaned up
- Fixed issue where captcha containers were not safely removed on component unmount

**Improvements:**
- Added destroy() method for proper cleanup of SDK instances
- Implemented safe DOM element removal with parent node validation
- Enhanced reset() method with error handling to prevent crashes
- Improved _renderContent() to safely clear containers before rendering
- Added proper event listener cleanup in _setupMouseTracking()
- Better handling of edge cases when SDK is destroyed during initialization


### Version 1.0.2
**Release Date:** 2025-11-11

**Improvements:**
- Fixed captcha styling issues
- Improved visual consistency across different themes
- Enhanced CSS compatibility with various frameworks
- Better responsive design for mobile devices

---

### Version 1.0.1
**Release Date:** 2025-11-10

**Improvements:**
- Performance optimization during captcha initialization
- Added loading indicator while captcha is being initialized
- Improved user feedback during SDK loading
- Better handling of slow network connections

---

### Version 1.0.0
**Release Date:** 2025-11-09

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
