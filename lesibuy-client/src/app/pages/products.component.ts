import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;

        this.route.queryParams.subscribe(params => {
          this.selectedCategory = params['category'] || 'All';
          this.searchTerm = (params['search'] || '').toLowerCase().trim();
          this.applyFilters();
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
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

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        this.getCategoryName(product.categoryId) === this.selectedCategory;

      const searchableText = `
        ${product.name}
        ${product.description}
        ${this.getCategoryName(product.categoryId)}
        ${product.condition}
      `.toLowerCase();

      const matchesSearch =
        !this.searchTerm || searchableText.includes(this.searchTerm);

      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;

    if (category === 'All') {
      this.router.navigate(['/'], {
        queryParams: this.searchTerm ? { search: this.searchTerm } : {},
        fragment: 'featured-products'
      });
      return;
    }

    this.router.navigate(['/'], {
      queryParams: {
        category,
        ...(this.searchTerm ? { search: this.searchTerm } : {})
      },
      fragment: 'featured-products'
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/products', id]);
  }
}