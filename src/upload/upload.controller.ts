import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { generateResizedImages } from 'src/common/storage';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('images', {
      storage: diskStorage({
        destination: './uploads/posts/temp',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // 直接调用你导入的函数
    const urls = await generateResizedImages(file, 'posts');
    return urls.original;
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos/original',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'video/mp4',
          'video/quicktime',
          'video/x-matroska',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Only video files are allowed!'), false);
        }
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const url = `/uploads/videos/original/${file.filename}`;
    return { filename: file.filename, url };
  }
}
