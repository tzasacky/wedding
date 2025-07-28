// Simple dev server with validation
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

// YAML parser (same as in index.html)
function parseYAML(yamlString) {
    const lines = yamlString.split('\n');
    const result = {};
    let currentObj = result;
    let currentKey = null;
    const stack = [result];
    const indentStack = [-1];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const indent = line.search(/\S/);
        const isArray = trimmed.startsWith('- ');
        const match = trimmed.match(/^(-?\s*)?([^:]+):\s*(.*)$/);

        if (isArray) {
            const value = trimmed.substring(2).trim();
            if (!Array.isArray(currentObj[currentKey])) {
                currentObj[currentKey] = [];
            }
            
            if (value.includes(':')) {
                const obj = {};
                const [k, v] = value.split(':').map(s => s.trim());
                obj[k] = v.replace(/^["']|["']$/g, '');
                currentObj[currentKey].push(obj);
            } else {
                currentObj[currentKey].push(value.replace(/^["']|["']$/g, ''));
            }
            return;
        }

        if (match) {
            const key = match[2].trim();
            const value = match[3].trim();

            while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
                stack.pop();
                indentStack.pop();
            }

            currentObj = stack[stack.length - 1];

            if (value) {
                currentObj[key] = value.replace(/^["']|["']$/g, '');
            } else {
                currentObj[key] = {};
                stack.push(currentObj[key]);
                indentStack.push(indent);
                currentKey = key;
            }
        }
    });

    return result;
}

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
    const config = parseYAML(yamlContent);
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