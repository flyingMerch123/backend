import { ApiProperty } from '@nestjs/swagger';

export class UploadImagesModel {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description:
      'Array of uploaded images (PNG or JPEG format, maximum 10 images allowed, maximum size: 20MB each)',
  })
  images: any[];
}
