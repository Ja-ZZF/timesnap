import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';


/**
 * 生成本地存储策略（返回 multer storage）
 * @param folder 上传的临时目录
 */
export function createStorageOption(folder: string) {
  return diskStorage({
    destination: join('uploads', folder, 'temp'),
    filename: (req, file, callback) => {
      const ext = extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      callback(null, filename);
    }
  });
}

//生成不同尺寸的图片
export async function generateResizedImages(
  file: Express.Multer.File,
  baseFolder: string
): Promise<Record<string, string>> {
  const sizes = {
    original: null,
    large: 1280,
    medium: 720,
    thumb: 200,
  };

  const baseUrl = process.env.BASE_URL || '';  // ✅ 从环境变量读取

  const ext = path.extname(file.originalname);
  const filename = file.filename;
  const result: Record<string, string> = {};

  for (const [key, width] of Object.entries(sizes)) {
    const outputDir = path.join('uploads', baseFolder, key);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);
    const relativePath = `/uploads/${baseFolder}/${key}/${filename}`;
    const publicUrl = `${baseUrl}${relativePath}`;

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

  // 删除临时文件
  try {
    fs.unlinkSync(file.path);
  } catch (e) {
    console.warn('⚠️ Failed to delete temp file:', e);
  }

  return result;
}
