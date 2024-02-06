import { ApiProperty } from '@nestjs/swagger';
import { ViewPostModel } from '../../../post/api/models/view.post.model';
import { PaginationViewModel } from '../../../post/api/pagination/pagination.view.model';

export class PublicViewProfileModel {
  @ApiProperty()
  userName: string;
  @ApiProperty()
  following: number;
  @ApiProperty()
  followers: number;
  @ApiProperty()
  postsCount: number;
  @ApiProperty()
  aboutMe: string;
  @ApiProperty()
  posts: PaginationViewModel<ViewPostModel>;
}
