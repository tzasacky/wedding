# 🏔️ Mountain Wedding Website

A beautiful, responsive wedding website optimized for GitHub Pages with mountain wedding theming.

**Live Demo**: [https://yourusername.github.io/wedding](https://yourusername.github.io/wedding)

## ✨ Features

- **🏔️ Mountain Wedding Theme** - Warm browns, mountain graphics, clean typography
- **🌙 Smart Dark/Light Mode** - Manual toggle with persistent storage + system preference
- **⚡ Performance Optimized** - All advanced features enabled, sub-second loading
- **📱 Fully Responsive** - Mobile-first design, touch-friendly
- **🔄 Always-On Features** - Countdown, animations, lazy loading, offline support
- **💍 Wedding Focused** - Ceremony/reception details, hotels, registry, RSVP
- **100% Free** - Hosted on GitHub Pages forever
- **Google Forms RSVP** - No backend needed

## 🛠️ Prerequisites

You'll need these tools installed:

### Required
- **Git** - [Download here](https://git-scm.com/downloads) or use GitHub Desktop
- **GitHub Account** - [Sign up free](https://github.com)

### Recommended (for best experience)
- **Bun** - [Install here](https://bun.sh) - Fast JavaScript runtime for local development

### Alternative (if you can't use Bun)
- **Node.js** - [Download here](https://nodejs.org) - Works but slower than Bun

## 🚀 Quick Setup Guide

**Option A: Fork on GitHub (easiest)**
1. Click the **"Fork"** button at the top right of this page
2. Name it `wedding` (or whatever you want)
3. Clone to your computer: `git clone https://github.com/YOUR-USERNAME/wedding.git`

**Option B: Download and create new repo**
1. Click **"Code"** → **"Download ZIP"**
2. Extract and rename folder to `wedding`
3. [Create new repository](https://github.com/new) on GitHub
4. Upload your files

### Step 2: Enable GitHub Pages (2 minutes)
1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. Click **Save**

✅ Your site will be live at: `https://YOUR-USERNAME.github.io/wedding`

### Step 3: Install Development Tools (3 minutes)

**Install Bun** (recommended):
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Or install Node.js** (alternative):
- Download from [nodejs.org](https://nodejs.org)
- Follow installer instructions

### Step 4: Create Google Form for RSVPs (5 minutes)
1. Go to [**Google Forms**](https://forms.google.com) (requires Google account)
2. Click **"Blank"** to create a new form
3. Add these fields:
   - **Name** (Short answer, Required)
   - **Email** (Short answer, Required) 
   - **Number of Guests** (Multiple choice: 1, 2, 3, 4)
   - **Dietary Restrictions** (Paragraph, Optional)
   - **Message** (Paragraph, Optional)
4. Click **Send** → **Link icon** → Copy link
5. Replace `/viewform` with `/viewform?embedded=true` at the end

**🔒 SECURITY (Important!)**: Protect from spam:
- Click **Settings** (gear icon) → **Responses**
- Turn on **"Limit to 1 response"**
- Consider adding a passcode question as the first field
- Enable **"Response receipts"** for confirmations

### Step 5: Customize Your Wedding Details (5 minutes)
Open `config.yaml` in any text editor and update with your details:

```yaml
couple:
  names: "Your Names Here"

date:
  display: "10.14.2024"
  iso: "2024-10-14T15:00:00"

ceremony:
  time: "3:00 PM"
  venue: "Beautiful Church"
  address: "123 Main St"
  city: "Your City, ST 12345"

rsvp:
  deadline: "2024-09-14"
  form_url: "YOUR_GOOGLE_FORM_URL_HERE"
```

### Step 6: Test Locally (2 minutes)
Navigate to your project folder and start the dev server:

```bash
cd wedding

# If you have Bun
bun run dev

# If you have Node.js
npm run dev
```

Visit **http://localhost:3000** to see your site!

### Step 7: Deploy to GitHub Pages (1 minute)
When you're happy with your changes:

```bash
# Generate the production config
bun run build   # or: npm run build

# Commit your changes  
git add .
git commit -m "Update wedding details"
git push
```

✅ **Your site is now live!** Visit `https://YOUR-USERNAME.github.io/wedding`

## ✅ Quick Start Checklist
- [ ] Forked repository and enabled GitHub Pages
- [ ] Installed Bun (or Node.js) 
- [ ] Created Google Form with security settings
- [ ] Updated `config.yaml` with your wedding details
- [ ] Tested locally with `bun run dev`
- [ ] Built and deployed with `bun run build` + `git push`
- [ ] Tested on mobile device
- [ ] Shared link with partner for approval

## 📝 Configuration Guide

### Required Fields
- `couple.names` - Your names (e.g., "Jane & John")
- `date.display` - Wedding date (e.g., "10.14.2024")
- `date.iso` - ISO format for calculations (e.g., "2024-10-14")
- `rsvp.formUrl` - Your Google Form URL with `?embedded=true`

### Optional Customization
- `theme.primary` - Your wedding color (default: mountain brown #8B4513)
- `theme.font` - Google Font name (default: "Montserrat")
- `dressCode` - e.g., "Mountain Formal", "Cocktail", "Casual"
- `footer.text` - Customize the footer message

### Adding/Removing Sections
Edit the `sections` array in config.json:
```json
"sections": [
  { "id": "home", "name": "Home" },
  { "id": "details", "name": "Details" },
  { "id": "accommodations", "name": "Hotels", "enabled": false },
  { "id": "rsvp", "name": "RSVP" }
]
```

## 🖼️ Adding Images

1. Create an `images` folder in your repository
2. Add your images (keep them under 1MB for fast loading)
3. Reference in config.json:
```json
"images": {
  "hero": "./images/hero.jpg",
  "venue": "./images/venue.jpg"
}
```

## 🎨 Color Themes

Change `theme.primary` in config.yaml:
- Mountain Brown (default): `"#8B4513"`
- Forest Green: `"#2E8B57"`
- Classic Gold: `"#d4af37"`
- Romantic Rose: `"#e8b4b8"`
- Sage Green: `"#87a96b"`
- Navy Blue: `"#2c3e50"`
- Burgundy: `"#800020"`

## 📱 Sharing Your Site

The site includes a share button that:
- On mobile: Opens native share dialog
- On desktop: Copies link to clipboard

## 🔧 Advanced Customization

### Custom Domain
1. Create a file named `CNAME` with your domain (e.g., `ourwedding.com`)
2. Configure your domain's DNS to point to GitHub Pages

### Multiple Events
Add more events to config.json:
```json
"welcome": {
  "time": "7:00 PM",
  "venue": "Hotel Bar",
  "address": "789 Hotel St",
  "city": "Your City, ST 12345"
}
```

### Accommodations Section
Add hotel blocks:
```json
"hotels": [
  {
    "name": "Grand Hotel",
    "rate": "$150/night",
    "code": "SMITHWEDDING",
    "link": "https://hotel.com/wedding-block"
  }
]
```

## 🤝 Contributing

Found a bug or want to add a feature? Pull requests are welcome!

## 📊 Tech Stack

- **Hosting**: GitHub Pages (free forever)
- **Framework**: None! Just vanilla HTML/CSS/JS
- **RSVP**: Google Forms (free, no limits)
- **Offline**: Service Worker
- **Animations**: CSS + Intersection Observer
- **Sharing**: Web Share API

## ❓ FAQ

**Q: Is this really free?**
A: Yes! GitHub Pages is free for public repos. Your only cost might be a custom domain (optional).

**Q: Can guests RSVP on their phones?**
A: Yes! The Google Form embed is fully responsive.

**Q: What if GitHub Pages goes down?**
A: The site works offline once visited. GitHub Pages has 99.9% uptime.

**Q: Can I add more pages?**
A: Yes! Create new HTML files and link them in the navigation.

**Q: How do I see RSVP responses?**
A: Check your Google Form responses or link it to a Google Sheet.

## 🔒 Security for Google Forms

**IMPORTANT**: Protect your RSVP form from spam and uninvited responses:

1. **Limit Responses**: Settings → Responses → "Limit to 1 response"
2. **Add Passcode**: Include a passcode field that only invited guests know
3. **Email Collection**: Require email addresses to track responses
4. **Response Receipts**: Send confirmation emails to respondents
5. **Review Regularly**: Check for suspicious submissions

Example passcode question: "What's the secret word? (Hint: it rhymes with 'love')"

## 🔧 Development Workflow

### Local Development
```bash
# Start dev server (auto-converts YAML to JSON on-the-fly)  
bun run dev        # Recommended (faster)
# or
npm run dev        # If using Node.js

# Visit http://localhost:3000
```

The dev server automatically converts your `config.yaml` to JSON, so you see changes instantly!

### Production Deployment  
```bash
# Build static config.json for GitHub Pages
bun run build     # or: npm run build

# Deploy your changes
git add .
git commit -m "Update wedding details"  
git push
```

### Why the Build Step?
- **Development**: Edit human-friendly YAML, dev server converts on-the-fly
- **Production**: GitHub Pages serves pre-built JSON for maximum speed and reliability
- **Best of both worlds**: Easy editing + fast loading

### Available Commands
```bash
bun run dev       # Start development server
bun run build     # Generate config.json for production
```

## 🆘 Troubleshooting

### Site not loading?
- Check that GitHub Pages is enabled in repo Settings
- Make sure you ran `bun run build` before pushing
- Wait 5-10 minutes for GitHub Pages to deploy

### Config errors?
- Validate your YAML syntax - [use this tool](https://yamlchecker.com)
- Make sure indentation uses spaces, not tabs
- Check that required fields are filled in

### Form not working?
- Ensure Google Form URL ends with `?embedded=true`
- Test the form URL directly in a browser first
- Check that form allows public responses

### Dev server won't start?
```bash
# Install dependencies first
bun install    # or: npm install

# Then try starting again  
bun run dev    # or: npm run dev
```

### Need help?
- [Create an issue](https://github.com/tzasacky/wedding/issues) on GitHub
- Check existing issues for solutions

## 💡 Pro Tips

1. **Test on your phone** before sharing with guests
2. **Keep images small** - use [TinyPNG](https://tinypng.com) to compress
3. **Set up early** - gives you time to make tweaks  
4. **Share the link** 2-3 months before the wedding
5. **Backup your config** - save a copy of config.yaml
6. **Use descriptive commit messages** - helps track changes
7. **Test the RSVP form yourself** before going live

---

Made with ❤️ for couples who'd rather spend money on their honeymoon than a website.

*If this helped you, consider starring the repo to help others find it!*