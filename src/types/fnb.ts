export type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'ACCOUNT_BALANCE' | 'CASH_OR_QR';

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  count?: number;
  icon?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  prepTime: number;
  isAvailable: boolean;
  isHot: boolean;
  isBestSeller: boolean;
  badge?: string;
  noteDetail?: string;
  options?: string[];
  spicyLevels?: number[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  note?: string;
  selectedOption?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  menuItemId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  options?: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  pcName: string;
  zoneName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  note?: string | null;
  items: (OrderItem | string)[];
  timeElapsed?: string;
  station?: 'HOT_KITCHEN' | 'BAR' | 'SNACK';
  createdAt?: string | Date;
  cookingStartedAt?: string | Date;
  completedAt?: string | Date;
  updatedAt?: string | Date;
}

export type KdsFilterStation = 'ALL' | 'HOT_KITCHEN' | 'BAR';