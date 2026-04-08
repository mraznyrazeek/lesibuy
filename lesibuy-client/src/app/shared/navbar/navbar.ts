import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(private router: Router) {}

  goToCategory(category: string): void {
    if (category === 'All') {
      this.router.navigate(['/']);
      return;
    }

    this.router.navigate(['/'], {
      queryParams: { category }
    });
  }

  search(value: string): void {
    const currentUrl = this.router.parseUrl(this.router.url);
    const currentCategory = currentUrl.queryParams['category'] || '';

    this.router.navigate(['/'], {
      queryParams: {
        ...(currentCategory ? { category: currentCategory } : {}),
        ...(value.trim() ? { search: value.trim() } : {})
      }
    });
  }
}