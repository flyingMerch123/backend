import { ApiProperty } from '@nestjs/swagger';

export class ViewPostModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  createdAt: string;
}
