export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;

  condition: string;
  specifications: string;
  isAvailable: boolean;
  sellerType: string;
  createdAt: string;
}
