#!/usr/bin/env bun
/**
 * Convert all images to WebP format, update references, and clean up old files
 * Usage: bun run convert-to-webp
 */

import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = './images';
const CONFIG_YAML = './config.yaml';
const INDEX_HTML = './index.html';

// Image formats to convert
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

/**
 * Get all image files that need conversion
 */
async function getImagesToConvert() {
  const files = await readdir(IMAGES_DIR);
  return files.filter(file => {
    const ext = parse(file).ext;
    return IMAGE_EXTENSIONS.includes(ext);
  });
}

/**
 * Convert an image to WebP format
 */
async function convertToWebP(filename) {
  const inputPath = join(IMAGES_DIR, filename);
  const { name } = parse(filename);
  const outputFilename = `${name}.webp`;
  const outputPath = join(IMAGES_DIR, outputFilename);

  console.log(`📸 Converting ${filename} → ${outputFilename}`);

  try {
    await sharp(inputPath)
      .webp({ quality: 85 }) // Good quality/size balance
      .toFile(outputPath);

    const inputStats = await Bun.file(inputPath).size;
    const outputStats = await Bun.file(outputPath).size;
    const savings = ((1 - outputStats / inputStats) * 100).toFixed(1);

    console.log(`  ✓ Saved ${savings}% (${(inputStats / 1024 / 1024).toFixed(2)}MB → ${(outputStats / 1024 / 1024).toFixed(2)}MB)`);

    return { original: filename, webp: outputFilename };
  } catch (error) {
    console.error(`  ✗ Failed to convert ${filename}:`, error.message);
    return null;
  }
}

/**
 * Update references in a file
 */
async function updateReferences(filePath, conversions) {
  console.log(`\n📝 Updating references in ${filePath}`);

  let content = await readFile(filePath, 'utf-8');
  let updateCount = 0;

  for (const { original, webp } of conversions) {
    const originalPattern = new RegExp(original.replace('.', '\\.'), 'g');
    const matches = content.match(originalPattern);

    if (matches) {
      content = content.replace(originalPattern, webp);
      updateCount += matches.length;
      console.log(`  ✓ Updated ${matches.length} reference(s): ${original} → ${webp}`);
    }
  }

  if (updateCount > 0) {
    await writeFile(filePath, content, 'utf-8');
    console.log(`  ✓ Saved ${updateCount} total updates`);
  } else {
    console.log(`  ℹ No references found to update`);
  }

  return updateCount;
}

/**
 * Delete old image files
 */
async function deleteOldImages(conversions) {
  console.log(`\n🗑️  Deleting old image files`);

  for (const { original } of conversions) {
    const filePath = join(IMAGES_DIR, original);
    try {
      await unlink(filePath);
      console.log(`  ✓ Deleted ${original}`);
    } catch (error) {
      console.error(`  ✗ Failed to delete ${original}:`, error.message);
    }
  }
}

/**
 * Main conversion process
 */
async function main() {
  console.log('🚀 Starting WebP conversion process...\n');

  // Get all images to convert
  const imagesToConvert = await getImagesToConvert();

  if (imagesToConvert.length === 0) {
    console.log('✓ No images to convert - all images are already in WebP format!');
    return;
  }

  console.log(`Found ${imagesToConvert.length} image(s) to convert:\n`);
  imagesToConvert.forEach(img => console.log(`  • ${img}`));
  console.log();

  // Convert all images
  console.log('Converting images...\n');
  const conversions = [];

  for (const image of imagesToConvert) {
    const result = await convertToWebP(image);
    if (result) {
      conversions.push(result);
    }
  }

  if (conversions.length === 0) {
    console.error('\n✗ No images were successfully converted');
    process.exit(1);
  }

  // Update references in config files
  const configUpdates = await updateReferences(CONFIG_YAML, conversions);
  const htmlUpdates = await updateReferences(INDEX_HTML, conversions);

  // Delete old images
  await deleteOldImages(conversions);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Conversion complete!');
  console.log('='.repeat(50));
  console.log(`Images converted: ${conversions.length}`);
  console.log(`References updated in config.yaml: ${configUpdates}`);
  console.log(`References updated in index.html: ${htmlUpdates}`);
  console.log('\n💡 Next steps:');
  console.log('  1. Run: bun run build');
  console.log('  2. Test your site locally');
  console.log('  3. Commit and push changes');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
