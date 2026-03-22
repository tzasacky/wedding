#!/usr/bin/env bun

// Build script — injects meta tags into index.html from config.yaml
// No config.json is generated; the browser loads config.yaml directly via js-yaml CDN.
import { existsSync } from 'fs';
import { parse } from 'yaml';
import { injectMeta, revertMeta } from './scripts/meta.js';

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
