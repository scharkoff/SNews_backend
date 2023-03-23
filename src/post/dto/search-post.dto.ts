enum PostViewsTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchPostDTO {
  title?: string;
  body?: string;
  views?: PostViewsTypeEnum;
  tag?: string;
  limit?: number;
  take?: number;
}
