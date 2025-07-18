import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputDir = path.join(__dirname, '../static/rcs/cards');
const outputDir = path.join(__dirname, '../static/rcs/cards-optimized');
const width = 400;

fs.mkdirSync(outputDir, { recursive: true });

const supportedExtensions = ['.jpg', '.jpeg', '.png'];

fs.readdirSync(inputDir).forEach((file) => {
	const ext = path.extname(file).toLowerCase();
	if (!supportedExtensions.includes(ext)) return;

	const inputPath = path.join(inputDir, file);
	const baseName = path.basename(file, ext);
	const outputPath = path.join(outputDir, `${baseName}.webp`);

	sharp(inputPath)
		.resize({ width })
		.webp({ quality: 80 })
		.toFile(outputPath)
		.then(() => console.log(`Converted: ${file} -> ${baseName}.webp`))
		.catch((err) => console.error(`Failed to process ${file}`, err));
});

//
// Usage: Run this script with Node.js to optimize images
// node scripts/optimize-images.js
// 