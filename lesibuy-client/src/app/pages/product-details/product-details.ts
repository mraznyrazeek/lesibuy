import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  specifications: { key: string; value: string }[] = [];
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) {
        console.error('Invalid product id');
        return;
      }

      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.parseSpecifications(data.specifications);
        },
        error: (err) => {
          console.error('Error loading product details:', err);
        }
      });
    });
  }

  parseSpecifications(specifications: string): void {
    try {
      const parsed = JSON.parse(specifications);
      this.specifications = Object.keys(parsed).map(key => ({
        key: this.formatSpecKey(key),
        value: parsed[key]
      }));
    } catch (error) {
      console.error('Invalid specifications JSON', error);
      this.specifications = [];
    }
  }

  formatSpecKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }

  getCategoryName(id: number): string {
    switch (id) {
      case 1: return 'iPhone';
      case 2: return 'iPad';
      case 3: return 'MacBook';
      case 4: return 'Apple Watch';
      case 5: return 'Audio';
      default: return 'Unknown';
    }
  }

  getProductImage(): string {
  if (!this.product?.imageUrl) {
    return 'https://via.placeholder.com/300';
  }

  try {
    const parsed = JSON.parse(this.product.imageUrl);
    const firstImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;

    if (firstImage) {
      return `https://localhost:7225/uploads/${firstImage}`;
    }

    return 'https://via.placeholder.com/300';
  } catch (error) {
    console.error('Invalid imageUrl:', this.product?.imageUrl);
    return 'https://via.placeholder.com/300';
  }
}

onImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/300';
}

  addToCart(): void {
    if (!this.product || !this.product.isAvailable) return;

    this.cartService.addToCart(this.product);
    this.successMessage = 'Product added to cart successfully.';

    setTimeout(() => {
      this.successMessage = '';
    }, 2500);
  }

  buyNow(): void {
    if (!this.product || !this.product.isAvailable) return;

    this.cartService.addToCart(this.product);
    this.router.navigate(['/checkout']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}