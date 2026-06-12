#!/usr/bin/env bun

// Build script — injects meta tags into index.html from config.yaml
// No config.json is generated; the browser loads config.yaml directly via js-yaml CDN.
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { parse } from 'yaml';
import { injectMeta, revertMeta } from './scripts/meta.js';

// Files whose contents determine the service-worker cache version.
// Any change to one of these produces a new version, busting the old cache.
const CACHE_INPUTS = [
    'index.html',
    'config.yaml',
    'styles/main.css',
    'scripts/theme.js',
    'scripts/main.js',
];

// Recompute sw.js CACHE_VERSION from a content hash of the cached assets.
async function bumpServiceWorkerVersion() {
    if (!existsSync('sw.js')) return;
    const hash = createHash('sha256');
    for (const path of CACHE_INPUTS) {
        if (existsSync(path)) hash.update(await Bun.file(path).text());
    }
    const version = `wedding-${hash.digest('hex').slice(0, 8)}`;
    const sw = await Bun.file('sw.js').text();
    const updated = sw.replace(/const CACHE_VERSION = '[^']*';/, `const CACHE_VERSION = '${version}';`);
    if (updated !== sw) {
        await Bun.write('sw.js', updated);
        console.log(`Service worker cache version set to ${version}`);
    } else {
        console.log(`Service worker cache version unchanged (${version})`);
    }
}

async function build() {
    console.log('Building wedding site...');

    if (!existsSync('config.yaml')) {
        console.error('config.yaml not found');
        process.exit(1);
    }

    try {
        const yamlContent = await Bun.file('config.yaml').text();
        const config = parse(yamlContent);

        const html = await Bun.file('index.html').text();
        await Bun.write('index.html', injectMeta(html, config));
        console.log('Injected meta tags into index.html');

        await bumpServiceWorkerVersion();

        console.log('Build complete!');
    } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
    }
}

async function clean() {
    console.log('Cleaning build artifacts...');

    try {
        const html = await Bun.file('index.html').text();
        await Bun.write('index.html', revertMeta(html));
        console.log('Restored index.html placeholders');
    } catch (error) {
        console.error('Failed to revert index.html:', error.message);
    }

    console.log('Clean complete.');
}

if (import.meta.main) {
    if (process.argv.includes('--clean')) {
        clean();
    } else {
        build();
    }
}

export { build, clean };
