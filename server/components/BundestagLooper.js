import fs from 'fs';
import path from 'path';

class BundestagLooper {
  constructor(baseDir) {
    this.baseDir = baseDir; // Base directory containing the BT_XXXX folders
  }

  async findAllPngImages() {
    let directories = await fs.promises.readdir(this.baseDir, { withFileTypes: true });
    directories = directories.filter(dir => dir.isDirectory()).map(dir => dir.name).sort();

    if (directories.length === 0) {
      return []; // Return an empty array if no directories are found
    }

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
    files = files.filter(file => !file.isDirectory() && file.name.endsWith('.png')).map(file => file.name).sort();
    return files.map(file => path.join(dir, file));
  }
}

export default BundestagLooper
