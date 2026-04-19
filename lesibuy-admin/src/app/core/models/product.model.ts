export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  categoryId: number;
  categoryName?: string | null;
  condition?: string | null;
  sellerType?: string | null;
  specifications?: string | null;
  isAvailable?: boolean;
}