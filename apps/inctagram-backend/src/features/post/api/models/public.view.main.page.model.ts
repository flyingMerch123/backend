import { ApiProperty } from '@nestjs/swagger';
import { PublicViewPostModel } from './public.view.post.model';

export class PublicViewMainPageModel {
  @ApiProperty({ type: 'number' })
  usersCount: number;
  @ApiProperty({ type: [PublicViewPostModel] })
  lastPosts: PublicViewPostModel[];
}
