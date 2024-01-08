import { ApiProperty } from '@nestjs/swagger';

export class PublicViewPostModel {
  @ApiProperty()
  userName: string;
  @ApiProperty()
  photoUrl: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  comments: any[];
}
