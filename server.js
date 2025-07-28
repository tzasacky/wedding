// Simple dev server with validation
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');
import { parse } from 'yaml';

// Validate config
function validateConfig(config) {
    const errors = [];
    
    if (!config.couple?.names) errors.push('Missing couple.names');
    if (!config.date?.display) errors.push('Missing date.display');
    if (!config.date?.iso) errors.push('Missing date.iso');
    
    return errors;
}

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        let filePath;

        // Route handling
        if (url.pathname === '/') {
            filePath = 'index.html';
        } else if (url.pathname === '/validate') {
            // Validation endpoint
            try {
                const yamlContent = readFileSync('config.yaml', 'utf8');
                const config = parseYAML(yamlContent);
                const errors = validateConfig(config);
                
                return new Response(JSON.stringify({
                    valid: errors.length === 0,
                    errors,
                    config
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    valid: false,
                    errors: [error.message]
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (url.pathname === '/config.json') {
            // Dev mode: convert YAML to JSON on the fly
            try {
                const yamlContent = readFileSync('config.yaml', 'utf8');
                const config = parse(yamlContent);
                return new Response(JSON.stringify(config), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'Failed to parse config.yaml',
                    message: error.message
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else {
            filePath = url.pathname.slice(1);
        }

        // Serve static files
        try {
            if (existsSync(filePath)) {
                const file = Bun.file(filePath);
                return new Response(file);
            } else {
                return new Response('Not Found', { status: 404 });
            }
        } catch (error) {
            return new Response('Server Error', { status: 500 });
        }
    },
});

console.log('🎉 Wedding site dev server running at http://localhost:3000');
console.log('📝 Validation endpoint: http://localhost:3000/validate');

// Validate on startup
try {
    const yamlContent = readFileSync('config.yaml', 'utf8');
    const config = parse(yamlContent);
    const errors = validateConfig(config);
    
    if (errors.length === 0) {
        console.log('✅ Configuration is valid');
    } else {
        console.log('❌ Configuration errors:');
        errors.forEach(error => console.log(`  • ${error}`));
    }
} catch (error) {
    console.log('⚠️  Could not validate config:', error.message);
}