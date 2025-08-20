import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Configuration constants
const CONFIG = {
	width: 400,
	quality: 80,
	rotation: 180,
	supportedExtensions: ['.jpg', '.jpeg', '.png']
};

// Path setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, '../static/rcs/cards');
const outputDir = path.join(__dirname, '../static/rcs/cards-optimized');

/**
 * Processes a single image file
 * @param {string} file - The filename to process
 * @param {string} inputPath - Full input file path
 * @param {string} outputPath - Full output file path
 */
async function processImage(file, inputPath, outputPath) {
	try {
		await sharp(inputPath)
			.resize({ width: CONFIG.width })
			.webp({ quality: CONFIG.quality })
			.rotate(CONFIG.rotation)
			.toFile(outputPath);

		const baseName = path.basename(outputPath);
		console.log(`✓ Converted: ${file} -> ${baseName}`);
	} catch (err) {
		console.error(`✗ Failed to process ${file}:`, err.message);
	}
}

/**
 * Checks if file has supported extension
 * @param {string} file - The filename to check
 * @returns {boolean} - True if supported
 */
function isSupportedFile(file) {
	const ext = path.extname(file).toLowerCase();
	return CONFIG.supportedExtensions.includes(ext);
}

/**
 * Main function to optimize images
 */
async function optimizeImages() {
	try {
		// Ensure output directory exists
		fs.mkdirSync(outputDir, { recursive: true });

		// Read input directory
		const files = fs.readdirSync(inputDir);
		const supportedFiles = files.filter(isSupportedFile);

		console.log(`Found ${supportedFiles.length} image(s) to process...`);

		// Process each supported file
		const promises = supportedFiles.map(file => {
			const inputPath = path.join(inputDir, file);
			const baseName = path.basename(file, path.extname(file));
			const outputPath = path.join(outputDir, `${baseName}.webp`);

			return processImage(file, inputPath, outputPath);
		});

		await Promise.all(promises);
		console.log(`\n✓ Processing complete! Optimized ${supportedFiles.length} image(s).`);

	} catch (err) {
		console.error('Error during image optimization:', err.message);
		process.exit(1);
	}
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	optimizeImages();
}

//
// Usage: Run this script with Node.js to optimize images
// node scripts/optimize-images.js
//