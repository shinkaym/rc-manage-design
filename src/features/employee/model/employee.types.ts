import type { ApiSuccessResponse, PaginatedApiSuccessResponse, PaginationQuery } from '../../../shared/model/api.types';
import type { IsoDateTimeString, Uuid } from '../../../shared/model/common.types';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type Employee = {
  createdAt: IsoDateTimeString;
  email: string | null;
  id: Uuid;
  name: string;
  note: string | null;
  phone: string | null;
  status: EmployeeStatus;
  updatedAt: IsoDateTimeString;
};

export type CreateEmployeeRequest = {
  email?: string;
  name: string;
  note?: string;
  phone?: string;
  status?: EmployeeStatus;
};

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export type EmployeeListQuery = PaginationQuery & {
  search?: string;
  status?: EmployeeStatus;
};

export type DeleteEmployeeResponse = {
  deleted: boolean;
};

export type EmployeeResponse = ApiSuccessResponse<Employee>;

export type EmployeeListResponse = PaginatedApiSuccessResponse<Employee>;
