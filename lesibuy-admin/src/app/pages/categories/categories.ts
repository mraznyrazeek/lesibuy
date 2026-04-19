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

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error(err)
    });
  }

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;

    this.categoryService.create({ name: this.newCategoryName }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add category');
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Delete "${category.name}"?`)) return;

    this.categoryService.delete(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        console.error(err);
        alert('Failed to delete category');
      }
    });
  }
}