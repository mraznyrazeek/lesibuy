import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { orderservice, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css'
})
export class ordersuccessComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderservice: orderservice
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.orderservice.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
      },
      error: (err: any) => {
        console.error('Failed to load order:', err);
        this.router.navigate(['/']);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}