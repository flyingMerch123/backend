import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private maxSize: number,
    private validType: string[],
    private count?: { min: number; max: number },
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const maxSize = this.maxSize * (1024 * 1024);
    const error = {
      field: '',
      messages: [],
    };

    if (this.count) {
      if (
        !(value?.length >= this.count.min) ||
        !(value?.length <= this.count.max)
      ) {
        error.field = 'files';
        error.messages.push(
          `Count files should be more or equal ${this.count.min} and less or equal ${this.count.max}`,
        );
      }

      const typesIsValid = value?.every((file) => {
        return this.validType.includes(file.mimetype.split('/')[1]);
      });

      const sizeIsValid = value?.every((file) => {
        return file.size <= maxSize;
      });

      if (!sizeIsValid) {
        error.messages.push(
          `The file size should not be larger than ${this.maxSize}MB`,
        );
      }

      if (!typesIsValid) {
        error.messages.push('The file format is not valid');
      }
    } else {
      if (value.size > maxSize) {
        error.messages.push(
          `The file size should not be larger than ${this.maxSize}MB`,
        );
      }

      if (!this.validType.includes(value.mimetype.split('/')[1])) {
        error.messages.push('The file format is not valid');
      }
    }

    if (value?.fieldname || Array.isArray(value)) {
      error.field = value?.fieldname ?? value[0].fieldname;
    }

    if (error.messages.length) {
      throw new BadRequestException({ message: [error] });
    }
    return value;
  }
}
