import type { ApiSuccessResponse, PaginatedApiSuccessResponse, PaginationQuery } from '../../../shared/model/api.types';
import type { IsoDateTimeString, Uuid } from '../../../shared/model/common.types';

export type ExpenseCategory = {
  code: string | null;
  color: string | null;
  createdAt: IsoDateTimeString;
  icon: string | null;
  id: Uuid;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  updatedAt: IsoDateTimeString;
};

export type CreateExpenseCategoryRequest = {
  code?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  name: string;
};

export type UpdateExpenseCategoryRequest = Partial<CreateExpenseCategoryRequest>;

export type ExpenseCategoryListQuery = PaginationQuery & {
  isActive?: boolean;
  search?: string;
};

export type DeleteExpenseCategoryResponse = {
  deleted: boolean;
};

export type ExpenseCategoryResponse = ApiSuccessResponse<ExpenseCategory>;

export type ExpenseCategoryListResponse = PaginatedApiSuccessResponse<ExpenseCategory>;
