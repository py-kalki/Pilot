const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  console.log('Extracting Pilot P-glyph...');
  
  // 1. Extract the 'p' mark from public/pilot-logo.png
  // Bounding box: x: 0 to 185, y: 41 to 155 (width 185, height 114)
  const pGlyph = await sharp('public/pilot-logo.png')
    .extract({ left: 0, top: 41, width: 185, height: 114 })
    .toBuffer();
    
  const iconSize = 512;
  const glyphTargetWidth = 360;
  const glyphTargetHeight = Math.round(glyphTargetWidth * (114 / 185)); // ~222
  
  const resizedGlyph = await sharp(pGlyph)
    .resize(glyphTargetWidth, glyphTargetHeight, { fit: 'contain' })
    .toBuffer();
    
  // Create rounded squircle background SVG
  const bgSvg = Buffer.from(`
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${iconSize}" height="${iconSize}" rx="112" fill="#121110"/>
    </svg>
  `);
  
  const masterIcon512 = await sharp(bgSvg)
    .composite([
      {
        input: resizedGlyph,
        top: Math.round((iconSize - glyphTargetHeight) / 2),
        left: Math.round((iconSize - glyphTargetWidth) / 2),
      }
    ])
    .png()
    .toBuffer();
    
  // Write master icons to public and src/app
  fs.writeFileSync('src/app/icon.png', masterIcon512);
  fs.writeFileSync('public/icon.png', masterIcon512);
  fs.writeFileSync('public/pilot-icon.png', masterIcon512);
  
  // Apple touch icon (180x180)
  const appleIcon = await sharp(masterIcon512).resize(180, 180).png().toBuffer();
  fs.writeFileSync('src/app/apple-icon.png', appleIcon);
  fs.writeFileSync('public/apple-touch-icon.png', appleIcon);
  
  // Generate 32x32, 48x48, 16x16 PNGs
  const icon48 = await sharp(masterIcon512).resize(48, 48).png().toBuffer();
  const icon32 = await sharp(masterIcon512).resize(32, 32).png().toBuffer();
  const icon16 = await sharp(masterIcon512).resize(16, 16).png().toBuffer();
  
  fs.writeFileSync('public/favicon-32x32.png', icon32);
  fs.writeFileSync('public/favicon-16x16.png', icon16);
  
  // Create ICO file containing 16, 32, 48
  function createIco(pngBuffers) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type 1 = ICO
    header.writeUInt16LE(pngBuffers.length, 4); // Number of images
    
    let offset = 6 + pngBuffers.length * 16;
    const dirEntries = [];
    
    for (const buf of pngBuffers) {
      const entry = Buffer.alloc(16);
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      entry.writeUInt8(width >= 256 ? 0 : width, 0);
      entry.writeUInt8(height >= 256 ? 0 : height, 1);
      entry.writeUInt8(0, 2); // Color palette
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color planes
      entry.writeUInt16LE(32, 6); // Bits per pixel
      entry.writeUInt32LE(buf.length, 8); // Image size
      entry.writeUInt32LE(offset, 12); // Offset
      dirEntries.push(entry);
      offset += buf.length;
    }
    
    return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  }
  
  const icoBuffer = createIco([icon16, icon32, icon48]);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  
  // SVG Icon with embedded PNG glyph
  const glyphBase64 = resizedGlyph.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="112" fill="#121110"/>
  <image href="data:image/png;base64,${glyphBase64}" x="76" y="${Math.round((iconSize - glyphTargetHeight) / 2)}" width="${glyphTargetWidth}" height="${glyphTargetHeight}"/>
</svg>`;
  fs.writeFileSync('src/app/icon.svg', svgContent);
  fs.writeFileSync('public/favicon.svg', svgContent);
  
  console.log('✅ All Pilot favicons and icon files generated successfully!');
}

generateFavicons().catch(console.error);
