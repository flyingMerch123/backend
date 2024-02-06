import { ApiProperty } from '@nestjs/swagger';
import { ViewPostModel } from '../models/view.post.model';

export class PaginationViewModel<T> {
  @ApiProperty()
  pagesCount: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  itemsCount: number;
  @ApiProperty({ type: [ViewPostModel] })
  items: T[];
}
