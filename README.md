# NEVA OFM SDK

🛡️ Advanced AntiBot Protection System

## Installation

### Latest Stable
```html
<script src="https://cdn.neva-ofm.cc/latest/neva-ofm.js"></script>
```

### Latest Dev
```html
<script src="https://cdn.neva-ofm.cc/latest-dev/neva-ofm.js"></script>
```

### Specific Version
```html
<script src="https://cdn.neva-ofm.cc/v2.0.0/neva-ofm.js"></script>
```

## Usage
```javascript
const antibot = new AntiBot('your-site-key');
antibot.render('container-id');
```

## Development

### Dev version
```bash
git checkout dev
# Edit neva-ofm.js
git add neva-ofm.js
git commit -m "feat: something"
git push origin dev
# ✅ Auto-syncs to /latest-dev/
```

### Release
```bash
git checkout main
git merge dev
git tag v2.0.1
git push origin main --tags
# ✅ Auto-syncs to /latest/ and /v2.0.1/
```

## CDN Structure
