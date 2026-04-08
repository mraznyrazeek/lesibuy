import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.parseSpecifications(data.specifications);
        },
        error: (err) => {
          console.error('Error loading product details:', err);
        }
      });
    }
  }

  parseSpecifications(specifications: string): void {
    try {
      const parsed = JSON.parse(specifications);
      this.specifications = Object.keys(parsed).map(key => ({
        key,
        value: parsed[key]
      }));
    } catch (error) {
      console.error('Invalid specifications JSON', error);
      this.specifications = [];
    }
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
}
