import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './products-list.html',
  styleUrls: ['./products-list.scss']
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  selectedCategory = '';
  selectedCondition = '';
  selectedStatus = '';
  selectedSort = 'newest';

  currentPage = 1;
  pageSize = 10;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load products.';
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  get filteredProducts(): Product[] {
    let filtered = [...this.products];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.name ?? '').toLowerCase().includes(search) ||
        (product.categoryName ?? '').toLowerCase().includes(search) ||
        (product.condition ?? '').toLowerCase().includes(search)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(
        product => (product.categoryName ?? '').toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    if (this.selectedCondition) {
      filtered = filtered.filter(
        product => (product.condition ?? '').toLowerCase() === this.selectedCondition.toLowerCase()
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(product => {
        const status = product.isAvailable === false ? 'inactive' : 'active';
        return status === this.selectedStatus;
      });
    }

    switch (this.selectedSort) {
      case 'az':
        filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'za':
        filtered.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'oldest':
        filtered = filtered.reverse();
        break;
      case 'newest':
      default:
        break;
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedCondition = '';
    this.selectedStatus = '';
    this.selectedSort = 'newest';
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);
    if (!confirmed) return;

    this.productService.delete(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => {
        console.error(err);
        alert('Failed to delete product');
      }
    });
  }

  toggleStatus(product: Product): void {
    const updatedPayload = {
      ...product,
      isAvailable: !(product.isAvailable !== false)
    };

    this.productService.update(product.id, updatedPayload).subscribe({
      next: () => {
        product.isAvailable = updatedPayload.isAvailable;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update product status');
      }
    });
  }
}