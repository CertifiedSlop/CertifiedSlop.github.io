# CertifiedSlop.github.io

Official GitHub Pages website for the **Certified Slop** organization.

> We make slop. That's it.

## 🌐 Live Site

Visit: [https://certifiedslop.github.io/](https://certifiedslop.github.io/)

## 📁 Project Structure

```
CertifiedSlop.github.io/
├── index.html      # Main HTML page
├── css/
│   └── style.css   # Dark theme styles
├── js/
│   └── main.js     # GitHub API integration
└── README.md       # This file
```

## ✨ Features

- **Dynamic Repository Loading**: Fetches all repositories from GitHub API automatically
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: GitHub-inspired dark color scheme
- **Repository Cards**: Displays name, description, language, license, stars, and forks
- **Wiki Links**: Shows wiki button for repositories with wikis enabled
- **Auto-Updates**: New repositories appear automatically when added to the organization

## 🚀 Deployment

This site is hosted on GitHub Pages. To deploy:

1. Push this repository to `CertifiedSlop/CertifiedSlop.github.io`
2. Go to **Settings** → **Pages**
3. Set **Source** to `Deploy from a branch`
4. Set **Branch** to `main` and folder to `/ (root)`
5. Click **Save**

The site will be available at: `https://certifiedslop.github.io/`

## 🛠️ Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/CertifiedSlop/CertifiedSlop.github.io.git
   cd CertifiedSlop.github.io
   ```

2. Open `index.html` in a browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

3. Visit `http://localhost:8000`

## 📊 Repositories Displayed

The site automatically displays all public repositories from the CertifiedSlop organization:

| Repository | Description |
|------------|-------------|
| websAIte | Runtime generated AI website |
| calculAItor | Python package for AI math calculations |
| SQuAiL | Production-Ready LLM-Powered Relational Database* |
| AIuth | Production-Ready Vibe-Based Auth Library |
| Slopix | Linux kernel fork with AI improvements |
| Slop-Package-manager | Package manager for OpenSLOP |
| MooAId | AI assistant tool |
| MooAIdroid | Android AI assistant |
| CalcAIdroid | LLM-based Android calculator |
| WikAI | AI-powered wiki tool |
| AIpp-opener | App opener utility |
| .github | Organization configuration |
| CertifiedSlop | Organization profile |

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --bg-primary: #0d1117;      /* Main background */
    --accent-primary: #58a6ff;  /* Primary accent color */
    --accent-secondary: #238636; /* Secondary accent */
}
```

### Modifying Organization Info

Edit the header section in `index.html`:

```html
<div class="org-info">
    <h1>Certified Slop</h1>
    <p class="tagline">We make slop. That's it.</p>
</div>
```

## 📄 License

This website is licensed under the MIT License.

---

Made with ❤️ by Certified Slop
