# 💍 Free Wedding Website in 10 Minutes

Create a beautiful, fast, and free wedding website using GitHub Pages. No coding required!

**Live Demo**: [https://yourusername.github.io/wedding](https://yourusername.github.io/wedding)

## ✨ Features

- **100% Free** - Hosted on GitHub Pages
- **No Build Process** - Just edit and push
- **Mobile Friendly** - Looks great on all devices
- **Offline Support** - Works without internet at the venue
- **Dark Mode** - Automatically matches system preference
- **Google Forms RSVP** - No backend needed
- **Fast** - Loads in under 1 second
- **SEO Friendly** - Helps guests find your site

## 🚀 Setup in 10 Minutes

### 1. Fork This Repository (30 seconds)
- Click the "Fork" button at the top right of this page
- Name it `wedding` (or whatever you want)

### 2. Enable GitHub Pages (1 minute)
1. Go to your forked repo's Settings
2. Scroll to "Pages" section
3. Source: Deploy from a branch
4. Branch: `main` / `root`
5. Click Save

Your site will be live at: `https://YOUR-USERNAME.github.io/wedding`

### 3. Create Google Form for RSVPs (5 minutes)
1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with these fields:
   - Name (Short answer, Required)
   - Email (Short answer, Required)
   - Number of Guests (Multiple choice: 1, 2, 3, 4)
   - Dietary Restrictions (Paragraph, Optional)
   - Message (Paragraph, Optional)
3. Click Send → Link icon → Copy link
4. Replace `/viewform` with `/viewform?embedded=true` at the end
5. **SECURITY**: Restrict responses to invited guests only:
   - Click Settings (gear icon) → Responses
   - Turn on "Limit to 1 response"
   - Consider adding a passcode question as the first field
   - Or use "Response receipts" to get email confirmations

### 4. Customize Your Site (3 minutes)
Edit `config.yaml` with your details:

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

### 5. Build for Production (30 seconds)
```bash
# Generate config.json from config.yaml
bun run build
```

### 6. Push Your Changes (30 seconds)
- If using GitHub Web: Upload the generated `config.json` file along with your changes
- If using Git: `git add . && git commit -m "Update config" && git push`

### 7. Quick Start Checklist
- [ ] Changed couple names
- [ ] Updated wedding date
- [ ] Added ceremony details
- [ ] Added reception details  
- [ ] Created Google Form
- [ ] Added form URL to config
- [ ] Added security to Google Form
- [ ] Tested on phone
- [ ] Shared with partner

**That's it! Your site is live! 🎉**

## 📝 Configuration Guide

### Required Fields
- `couple.names` - Your names (e.g., "Jane & John")
- `date.display` - Wedding date (e.g., "10.14.2024")
- `date.iso` - ISO format for calculations (e.g., "2024-10-14")
- `rsvp.formUrl` - Your Google Form URL with `?embedded=true`

### Optional Customization
- `theme.primary` - Your wedding color (default: gold #d4af37)
- `theme.font` - Google Font name (default: "Playfair Display")
- `dressCode` - e.g., "Black Tie", "Cocktail", "Casual"
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

Change `theme.primary` in config.json:
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

## 🚀 Local Development

For the best experience, use Bun for local development:

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Start dev server (auto-converts YAML to JSON)
bun run dev

# Visit http://localhost:3000
```

### Build for Production

Before deploying to GitHub Pages, convert your YAML config to JSON:

```bash
# Build config.json from config.yaml
bun run build

# Commit both files
git add config.yaml config.json
git commit -m "Update config"
git push
```

**Why the build step?** GitHub Pages is static hosting, so we can't parse YAML client-side reliably. The build step keeps your config human-friendly (YAML) while serving fast, reliable JSON to browsers.

## 💡 Tips

1. **Test on your phone** before sharing with guests
2. **Keep images small** - use [TinyPNG](https://tinypng.com) to compress
3. **Set up early** - gives you time to make tweaks
4. **Share the link** 2-3 months before the wedding
5. **Backup your config** - save a copy of config.yaml

---

Made with ❤️ for couples who'd rather spend money on their honeymoon than a website.

*If this helped you, consider starring the repo to help others find it!*