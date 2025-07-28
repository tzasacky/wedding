#!/usr/bin/env bun

// Build script - converts YAML config to JSON for production
import { existsSync } from 'fs';
import { parse } from 'yaml';

async function build() {
    console.log('🔨 Building wedding site...');
    
    // Check if config.yaml exists
    if (!existsSync('config.yaml')) {
        console.error('❌ config.yaml not found');
        process.exit(1);
    }
    
    try {
        // Read and parse YAML using Bun's native YAML support
        const yamlContent = await Bun.file('config.yaml').text();
        const config = parse(yamlContent);
        
        // Write JSON file
        const jsonContent = JSON.stringify(config, null, 2);
        await Bun.write('config.json', jsonContent);
        
        console.log('✅ Generated config.json');
        console.log('📦 Build complete! Ready for GitHub Pages.');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Only run if called directly
if (import.meta.main) {
    build();
}

export { build };