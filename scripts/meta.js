// Shared meta tag generation for build.js and server.js
// NOT a browser module — used at build/dev time only

export function generateMeta(config) {
    const s = config.site;
    return [
        `<meta name="generator" content="${s.generator}">`,
        `<title>${s.title}</title>`,
        `<meta name="title" content="${s.title}">`,
        `<meta name="description" content="${s.description}">`,
        `<meta name="author" content="${s.author}">`,
        `<meta name="robots" content="index, follow">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:title" content="${s.title}">`,
        `<meta property="og:description" content="${s.description}">`,
        `<meta property="og:site_name" content="${s.pwa.name}">`,
        `<meta property="twitter:card" content="summary_large_image">`,
        `<meta property="twitter:title" content="${s.title}">`,
        `<meta property="twitter:description" content="${s.description}">`,
    ].join('\n    ');
}

export function generateFontLink(config) {
    const encoded = config.theme.font.replace(/ /g, '+');
    return [
        `<link rel="preload" href="https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
        `<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;700&display=swap"></noscript>`,
    ].join('\n    ');
}

export function generateFavicon(config) {
    const emoji = config.site.favicon_emoji;
    return [
        `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>${emoji}</text></svg>">`,
        `<link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect width='180' height='180' fill='%23FFFFFF'/><text x='90' y='140' font-size='90' text-anchor='middle'>${emoji}</text></svg>">`,
    ].join('\n    ');
}

export function generateManifest(config) {
    const pwa = config.site.pwa;
    const emoji = config.site.favicon_emoji;
    const manifest = {
        name: pwa.name, short_name: pwa.short_name, start_url: './',
        display: 'standalone', background_color: pwa.background_color, theme_color: pwa.theme_color,
        icons: [{
            src: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' fill='%23FFFFFF'/><text x='96' y='140' font-size='100' text-anchor='middle'>${emoji}</text></svg>`,
            sizes: '192x192', type: 'image/svg+xml'
        }]
    };
    return `<link rel="manifest" href="data:application/json,${encodeURIComponent(JSON.stringify(manifest))}">`;
}

// Revert injected meta back to GENERATED_* placeholders
export function revertMeta(html) {
    html = html.replace(
        /(    <meta name="format-detection"[^>]*>\n)([\s\S]*?)(    <link rel="preload" href="config\.yaml")/,
        `$1    <!-- GENERATED_META -->\n$3`
    );
    html = html.replace(
        /(    <link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>\n)([\s\S]*?)(    <link rel="stylesheet" href="styles\/main\.css")/,
        `$1    <!-- GENERATED_FONT_LINK -->\n    <!-- GENERATED_FAVICON -->\n    <!-- GENERATED_MANIFEST -->\n$3`
    );
    return html;
}

// Idempotent injection — works on template (placeholders) or already-built file
export function injectMeta(html, config) {
    html = html.replace(
        /(    <meta name="format-detection"[^>]*>\n)([\s\S]*?)(    <link rel="preload" href="config\.yaml")/,
        `$1    ${generateMeta(config)}\n$3`
    );
    html = html.replace(
        /(    <link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>\n)([\s\S]*?)(    <link rel="stylesheet" href="styles\/main\.css")/,
        `$1    ${generateFontLink(config)}\n    ${generateFavicon(config)}\n    ${generateManifest(config)}\n$3`
    );
    return html;
}
