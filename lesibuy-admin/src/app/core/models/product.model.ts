export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  isActive?: boolean;
  condition?: string | null;
  sellerType?: string | null;
  specifications?: string | null;
}