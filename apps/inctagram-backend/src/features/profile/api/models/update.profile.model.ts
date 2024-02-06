import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileModel {
  @ApiProperty({
    minimum: 6,
    maximum: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 30)
  userName: string;
  @ApiProperty({
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 50)
  @Matches('^[A-Za-zА-Яа-я]+$')
  firstName: string;
  @ApiProperty({
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 50)
  @Matches('^[A-Za-zА-Яа-я]+$')
  lastName: string;
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  dateOfBirth: string;
  @ApiProperty({
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 50)
  city: string;
  @ApiProperty({
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 50)
  country: string;
  @ApiProperty({
    minimum: 0,
    maximum: 200,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 200)
  aboutMe: string;
}
