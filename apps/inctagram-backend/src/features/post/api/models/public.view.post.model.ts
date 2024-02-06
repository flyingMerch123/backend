import { ApiProperty } from '@nestjs/swagger';

export class PublicViewPostModel {
  @ApiProperty()
  userName: string;
  @ApiProperty()
  imageUrl: string[];
  @ApiProperty()
  description: string;
  @ApiProperty()
  comments: any[];
}
