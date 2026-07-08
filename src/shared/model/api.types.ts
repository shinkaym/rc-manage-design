export type PaginationQuery = {
  limit?: number;
  page?: number;
};

export type PaginationMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  data: T;
  message: string;
  statusCode: number;
};

export type PaginatedApiSuccessResponse<T> = ApiSuccessResponse<T[]> & {
  pagination: PaginationMeta;
};

export type ApiErrorResponse = {
  error: string;
  message: string;
  path: string;
  statusCode: number;
  timestamp: string;
};
