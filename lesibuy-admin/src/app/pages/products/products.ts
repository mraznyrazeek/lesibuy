import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  showForm = false;
  isEditMode = false;
  editingProductId: number | null = null;

  newProduct = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    imageUrl: '',
    condition: '',
    sellerType: '',
    specifications: ''
  };

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load products.';
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.resetForm();
    this.isEditMode = false;
    this.editingProductId = null;
    this.showForm = true;
  }

  editProduct(product: any): void {
    this.newProduct = {
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? 0,
      stockQuantity: product.stockQuantity ?? 0,
      imageUrl: product.imageUrl ?? '',
      condition: product.condition ?? '',
      sellerType: product.sellerType ?? '',
      specifications: product.specifications ?? ''
    };

    this.isEditMode = true;
    this.editingProductId = product.id;
    this.showForm = true;
  }

  saveProduct(): void {
    const payload = {
      id: this.isEditMode ? this.editingProductId ?? 0 : 0,
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: Number(this.newProduct.price),
      stockQuantity: Number(this.newProduct.stockQuantity),
      imageUrl: this.newProduct.imageUrl,
      condition: this.newProduct.condition,
      sellerType: this.newProduct.sellerType,
      specifications: this.newProduct.specifications
    };

    if (this.isEditMode && this.editingProductId !== null) {
      this.productService.update(this.editingProductId, payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadProducts();
          this.resetForm();
        },
        error: (err) => {
          console.error('Update error:', err);
          console.log('Response body:', err?.error);
          alert(JSON.stringify(err?.error ?? 'Failed to update product'));
        }
      });
      return;
    }

    this.productService.create(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.loadProducts();
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add product');
      }
    });
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete product');
      }
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      condition: '',
      sellerType: '',
      specifications: ''
    };
    this.isEditMode = false;
    this.editingProductId = null;
  }
}