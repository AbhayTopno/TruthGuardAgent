import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const outputPath = path.join(
  __dirname,
  '..',
  'Frontend',
  'public',
  'downloads'
);
const zipFileName = 'TrustGuard-Extension.zip';

// Create downloads directory if it doesn't exist
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputPath, zipFileName));
const archive = archiver('zip', {
  zlib: { level: 9 }, // Maximum compression
});

output.on('close', function () {
  console.log('✅ Extension zip created successfully!');
  console.log(`📦 File: ${zipFileName}`);
  console.log(`📍 Location: ${path.join(outputPath, zipFileName)}`);
  console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

output.on('end', function () {
  console.log('Data has been drained');
});

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function (err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the entire dist directory to the zip
archive.directory(distPath, false);

// Finalize the archive
archive.finalize();
