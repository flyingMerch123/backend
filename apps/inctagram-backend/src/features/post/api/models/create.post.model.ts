import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostModel {
  @ApiProperty({
    minimum: 0,
    maximum: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 500)
  description: string;
}
