import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  products: Product[] = [];
  filteredProducts: Product[] = [];

  selectedCategory: string = 'All';
  searchTerm: string = '';

  currentPage = 1;
  itemsPerPage = 8;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

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

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    setTimeout(() => {
      document.getElementById('featured-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getCategoryName(product: Product): string {
    return product.categoryName || 'Unknown';
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return 'https://via.placeholder.com/250';
    }

    try {
      const parsed = JSON.parse(product.imageUrl);
      const firstImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;

      if (firstImage) {
        return `https://localhost:7225/uploads/${firstImage}`;
      }

      return 'https://via.placeholder.com/250';
    } catch (error) {
      console.error('Invalid imageUrl:', product.imageUrl);
      return 'https://via.placeholder.com/250';
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/250';
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const categoryName = this.getCategoryName(product);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        categoryName === this.selectedCategory;

      const searchableText = `
        ${product.name}
        ${product.description}
        ${categoryName}
        ${product.condition}
      `.toLowerCase();

      const matchesSearch =
        !this.searchTerm || searchableText.includes(this.searchTerm);

      return matchesCategory && matchesSearch;
    });

    this.currentPage = 1;
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
    if (!product.isAvailable) {
      alert('This product is currently unavailable.');
      return;
    }

    this.cartService.addToCart(product);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/products', id]);
  }
}