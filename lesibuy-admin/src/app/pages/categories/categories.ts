import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  newCategoryName = '';

  isLoading = false;
  isSaving = false;
  deletingId: number | null = null;

  editingId: number | null = null;
  editCategoryName = '';

  errorMessage = '';
  formError = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load categories.';
        this.isLoading = false;
      }
    });
  }

  addCategory(): void {
    this.formError = '';

    const name = this.newCategoryName.trim();

    if (!name) {
      this.formError = 'Please enter a category name.';
      return;
    }

    const alreadyExists = this.categories.some(
      category => category.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      this.formError = 'This category already exists.';
      return;
    }

    this.isSaving = true;

    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.isSaving = false;
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        this.formError = 'Failed to add category.';
        this.isSaving = false;
      }
    });
  }

  startEdit(category: Category): void {
    this.editingId = category.id;
    this.editCategoryName = category.name;
    this.formError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editCategoryName = '';
  }

  updateCategory(category: Category): void {
    const name = this.editCategoryName.trim();

    if (!name) {
      this.formError = 'Please enter a category name.';
      return;
    }

    const alreadyExists = this.categories.some(
      c => c.id !== category.id && c.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      this.formError = 'This category already exists.';
      return;
    }

    this.categoryService.update(category.id, { name }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        this.formError = 'Failed to update category.';
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Delete "${category.name}"?`)) return;

    this.deletingId = category.id;

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete category');
        this.deletingId = null;
      }
    });
  }
}