export interface OrderItem {
  productId: number;
  productName: string;
  productDescription?: string;
  productImageUrl?: string;
  productCondition?: string;
  sellerType?: string;
  specifications?: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  billingSameAsShipping: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  items: OrderItem[];
  isSeenByAdmin: boolean;
}