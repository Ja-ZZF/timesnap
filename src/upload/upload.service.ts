import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  async generateResizedImages(file: Express.Multer.File): Promise<Record<string, string>> {
    const sizes = {
      original: null,
      large: 1280,
      medium: 720,
      thumb: 200,
    };

    const ext = path.extname(file.originalname);
    const result: Record<string, string> = {};

    for (const [key, width] of Object.entries(sizes)) {
      const outputDir = path.join('uploads', 'posts', key);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, file.filename);
      const publicUrl = `/uploads/posts/${key}/${file.filename}`;

      try {
        if (key === 'original') {
          fs.copyFileSync(file.path, outputPath);
        } else {
          console.log(`🔧 Generating ${key} image: ${outputPath}`);
          await sharp(file.path)
            .resize({ width: width as number })
            .toFile(outputPath);
        }

        result[key] = publicUrl;
      } catch (err) {
        console.error(`❌ Failed to process ${key} image:`, err);
      }
    }

    // 可选：删除原始临时文件
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.warn('⚠️ Failed to delete temp file:', e);
    }

    return result;
  }
}
