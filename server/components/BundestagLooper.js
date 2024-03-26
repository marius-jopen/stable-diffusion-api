// BundestagLooper.js

import fs from 'fs';
import path from 'path';

class BundestagLooper {
  constructor(baseDir) {
    this.baseDir = baseDir; // Base directory containing the BT_XXXX folders
  }

  async findAllPngImages() {
    // Read all subdirectories in the base directory
    let directories = await fs.promises.readdir(this.baseDir, { withFileTypes: true });
    directories = directories
      .filter(dir => dir.isDirectory())
      .map(dir => dir.name)
      .sort(); // Ensure directories are sorted

    let images = [];
    for (const dir of directories) {
      const dirPath = path.join(this.baseDir, dir);
      const files = await this.readDirForPngFiles(dirPath);
      images = images.concat(files);
    }
    return images;
  }

  async readDirForPngFiles(dir) {
    let files = await fs.promises.readdir(dir, { withFileTypes: true });
    // Filter .png files, ignore directories and non-png files, and sort them to ensure order
    files = files
      .filter(file => !file.isDirectory() && file.name.endsWith('.png'))
      .map(file => file.name)
      .sort();
    // Convert file names to full paths
    return files.map(file => path.join(dir, file));
  }
}

export default BundestagLooper;
