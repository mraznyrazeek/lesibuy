import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css'
})
export class OrderSuccessComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/']);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}