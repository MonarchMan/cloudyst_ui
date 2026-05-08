export interface PaginationArgs {
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginationResults {
  page?: number;
  page_size?: number;
  total_items?: number;
}

export interface DeleteRequest {
  id: number;
  force?: boolean;
}

export interface ListTaskRequest {
  page?: number;
  page_size?: number;
  type?: string;
}

export enum ServiceName {
  ai = "ai",
  file = "file",
}
