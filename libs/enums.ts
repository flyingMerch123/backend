export enum InternalCode {
  Success = 1,
  NotFound = 0,
  Internal_Server = -1,
  Forbidden = -2,
  Unauthorized = -3,
  Expired = -4,
}

export enum EmailEvents {
  Registration,
  Recover_password,
}

export enum ApproachType {
  http = 'selectHttpException',
  qraphql = 'selectGraphQLExceptions',
}

export enum Services {
  FileService = 'FILE_SERVICE',
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}
