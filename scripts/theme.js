// Theme system - loaded before page render to prevent FOUC
// Defines window.applyConfigThemeVars for use by main.js and stats.html

window.applyConfigThemeVars = function(theme) {
    if (!window.siteConfig?.theme?.css_vars) return;

    const lightVars = window.siteConfig.theme.css_vars.light;
    const darkVars = window.siteConfig.theme.css_vars.dark;
    const activeVars = theme === 'dark' ? { ...lightVars, ...darkVars } : lightVars;

    for (const [key, value] of Object.entries(activeVars)) {
        document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    }

    // Compute primary RGB for rgba() usage in CSS
    const primaryColor = activeVars.primary;
    if (primaryColor) {
        const hex = primaryColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }

    // Set background image from config
    if (window.siteConfig.site?.background_image) {
        document.documentElement.style.setProperty('--bg-image', `url('${window.siteConfig.site.background_image}')`);
    }
};

(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
        }
        localStorage.setItem('theme', theme);

        if (window.siteConfig) {
            window.applyConfigThemeVars(theme);
        }
    }

    applyTheme(defaultTheme);

    window.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
            });
        }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
