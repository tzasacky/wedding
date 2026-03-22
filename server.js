// Dev server — serves static files, injects meta tags into index.html on the fly
import { existsSync, readFileSync } from 'fs';
import { parse } from 'yaml';
import { injectMeta } from './scripts/meta.js';

function validateConfig(config) {
    const errors = [];
    if (!config.couple?.names) errors.push('Missing couple.names');
    if (!config.date?.display) errors.push('Missing date.display');
    if (!config.date?.iso) errors.push('Missing date.iso');
    return errors;
}

const NO_CACHE = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === '/') {
            try {
                const html = readFileSync('index.html', 'utf8');
                const config = parse(readFileSync('config.yaml', 'utf8'));
                return new Response(injectMeta(html, config), {
                    headers: { 'Content-Type': 'text/html', ...NO_CACHE }
                });
            } catch (error) {
                return new Response(`Server Error: ${error.message}`, { status: 500 });
            }
        }

        if (url.pathname === '/validate') {
            try {
                const config = parse(readFileSync('config.yaml', 'utf8'));
                const errors = validateConfig(config);
                return new Response(JSON.stringify({ valid: errors.length === 0, errors }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return new Response(JSON.stringify({ valid: false, errors: [error.message] }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        const filePath = url.pathname.slice(1);
        try {
            if (filePath && existsSync(filePath)) {
                return new Response(Bun.file(filePath));
            }
            return new Response('Not Found', { status: 404 });
        } catch {
            return new Response('Server Error', { status: 500 });
        }
    },
});

console.log('Wedding site dev server running at http://localhost:3000');

try {
    const config = parse(readFileSync('config.yaml', 'utf8'));
    const errors = validateConfig(config);
    if (errors.length === 0) {
        console.log('Configuration is valid');
    } else {
        console.log('Configuration errors:');
        errors.forEach(e => console.log(`  - ${e}`));
    }
} catch (error) {
    console.log('Could not validate config:', error.message);
}
