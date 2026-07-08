import type { ApiSuccessResponse, PaginatedApiSuccessResponse, PaginationQuery } from '../../../shared/model/api.types';
import type {
  CurrencyCode,
  DecimalString,
  IsoDateString,
  IsoDateTimeString,
  Uuid,
} from '../../../shared/model/common.types';
import type { ExpenseCategory } from '../../category/model/category.types';

export type PaymentMethodType = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';

export type ReceiptSource = 'MANUAL' | 'OCR_IMPORT';

export type ReceiptStatus = 'ACTIVE' | 'DELETED' | 'NEEDS_REVIEW';

export type ReceiptExtractionStatus = 'PROCESSING' | 'NEEDS_REVIEW' | 'CONFIRMED' | 'FAILED' | 'CANCELED';

export type ReceiptExtractionProvider = 'MOCK' | 'OCR_AI' | 'DEEPSEEK';

export type StorageProvider = 'LOCAL' | 'S3' | 'GCS';

export type ReceiptItemInput = {
  categoryId?: Uuid;
  name: string;
  quantity?: number;
  sortOrder?: number;
  totalPrice: number;
  unitPrice?: number;
};

export type CreateReceiptRequest = {
  categoryId?: Uuid;
  currency: CurrencyCode;
  discountAmount?: number;
  items?: ReceiptItemInput[];
  merchantAddress?: string;
  merchantName: string;
  merchantPhone?: string;
  merchantTaxId?: string;
  note?: string;
  paymentCardLast4?: string;
  paymentMethodName?: string;
  paymentMethodType?: PaymentMethodType;
  paymentRawText?: string;
  receiptDate: IsoDateString;
  subtotalAmount?: number;
  tagNames?: string[];
  taxAmount?: number;
  tipAmount?: number;
  totalAmount: number;
};

export type UpdateReceiptRequest = Partial<CreateReceiptRequest>;

export type ConfirmReceiptExtractionRequest = CreateReceiptRequest;

export type ReceiptItem = {
  categoryId: Uuid | null;
  name: string;
  quantity: DecimalString;
  sortOrder: number;
  totalPrice: DecimalString;
  unitPrice: DecimalString | null;
};

export type Receipt = {
  category: ExpenseCategory | null;
  categoryId: Uuid | null;
  createdAt: IsoDateTimeString;
  currency: CurrencyCode;
  discountAmount: DecimalString;
  id: Uuid;
  items: ReceiptItem[];
  merchantAddress: string | null;
  merchantName: string;
  merchantNormalizedName: string;
  merchantPhone: string | null;
  merchantTaxId: string | null;
  note: string | null;
  paymentCardLast4: string | null;
  paymentMethodName: string | null;
  paymentMethodType: PaymentMethodType | null;
  paymentRawText: string | null;
  receiptDate: IsoDateString;
  source: ReceiptSource;
  status: ReceiptStatus;
  subtotalAmount: DecimalString;
  tagNames: string[];
  taxAmount: DecimalString;
  tipAmount: DecimalString;
  totalAmount: DecimalString;
  updatedAt: IsoDateTimeString;
};

export type ReceiptListQuery = PaginationQuery & {
  categoryId?: Uuid;
  currency?: CurrencyCode;
  fromDate?: IsoDateString;
  merchantName?: string;
  paymentMethodType?: PaymentMethodType;
  search?: string;
  toDate?: IsoDateString;
};

export type ReceiptImage = {
  checksum: string;
  createdAt: IsoDateTimeString;
  height: number | null;
  id: Uuid;
  mimeType: string;
  originalFilename: string;
  receiptId: Uuid;
  sizeBytes: DecimalString;
  storageProvider: StorageProvider;
  updatedAt: IsoDateTimeString;
  uploadedAt: IsoDateTimeString;
  width: number | null;
};

export type ReceiptExtractionDraftData = Partial<Omit<CreateReceiptRequest, 'items'>> & {
  items?: ReceiptItemInput[];
};

export type ReceiptExtraction = {
  canceledAt: IsoDateTimeString | null;
  checksum: string;
  confidenceScore: DecimalString | null;
  confirmedAt: IsoDateTimeString | null;
  confirmedReceiptId: Uuid | null;
  createdAt: IsoDateTimeString;
  errorMessage: string | null;
  extractedData: ReceiptExtractionDraftData;
  height: number | null;
  id: Uuid;
  mimeType: string;
  originalFilename: string;
  provider: ReceiptExtractionProvider;
  rawTextPreview: string | null;
  sizeBytes: DecimalString;
  status: ReceiptExtractionStatus;
  storageProvider: StorageProvider;
  updatedAt: IsoDateTimeString;
  width: number | null;
};

export type ConfirmReceiptExtractionResponse = {
  extraction: ReceiptExtraction;
  receipt: Receipt;
};

export type DeleteReceiptResponse = {
  deleted: boolean;
};

export type DeleteReceiptImageResponse = {
  deleted: boolean;
};

export type CancelReceiptExtractionResponse = {
  canceled: boolean;
};

export type ReceiptResponse = ApiSuccessResponse<Receipt>;

export type ReceiptListResponse = PaginatedApiSuccessResponse<Receipt>;

export type ReceiptImageResponse = ApiSuccessResponse<ReceiptImage>;

export type ReceiptImageListResponse = ApiSuccessResponse<ReceiptImage[]>;

export type ReceiptExtractionResponse = ApiSuccessResponse<ReceiptExtraction>;

export type ConfirmReceiptExtractionApiResponse = ApiSuccessResponse<ConfirmReceiptExtractionResponse>;


