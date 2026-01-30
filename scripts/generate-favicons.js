/**
 * Favicon Generation Script
 *
 * This script generates favicons from the icon.svg file.
 *
 * To use this script, you'll need to install sharp:
 * yarn add -D sharp
 *
 * Then run:
 * node scripts/generate-favicons.js
 *
 * Alternatively, you can use an online tool like:
 * - https://realfavicongenerator.net/
 * - https://favicon.io/
 *
 * Upload the public/icon.svg file and download the generated favicons.
 */

const fs = require("fs");
const path = require("path");

console.log("Favicon generation script");
console.log("========================\n");
console.log("To generate favicons, you have two options:\n");
console.log("Option 1: Use an online tool");
console.log("  1. Go to https://realfavicongenerator.net/");
console.log("  2. Upload public/icon.svg");
console.log("  3. Download and extract to public/\n");
console.log("Option 2: Install sharp and use this script");
console.log("  1. Run: yarn add -D sharp");
console.log("  2. Uncomment the code below");
console.log("  3. Run: node scripts/generate-favicons.js\n");

// Uncomment this code after installing sharp:
/*
const sharp = require('sharp');

const sizes = [16, 32, 48, 64, 128, 256, 512];
const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, `favicon-${size}x${size}.png`));
        console.log(`✓ Generated favicon-${size}x${size}.png`);
    }
    
    // Generate favicon.ico (16x16 and 32x32)
    await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(outputDir, 'favicon.png'));
    console.log('✓ Generated favicon.png');
    
    // Generate apple-touch-icon
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');
    
    console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
*/
