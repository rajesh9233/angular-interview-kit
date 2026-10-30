export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export type ProductPayload = Omit<Product, 'id'>;