import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { OrderService, CreateOrderResponse } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  orderPlaced = false;
  isSubmitting = false;
  placedOrderId: number | null = null;
  checkoutForm!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(3)]],
      paymentMethod: ['Cash on Delivery', Validators.required]
    });

    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.total = this.cartService.getCartTotal();

      if (items.length === 0 && !this.orderPlaced) {
        this.router.navigate(['/cart']);
      }
    });

    this.loadProfileIntoCheckout();
  }

  loadProfileIntoCheckout(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.checkoutForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || ''
        });
      },
      error: (err) => {
        console.error('Failed to load profile into checkout:', err);
      }
    });
  }

  get f() {
    return this.checkoutForm.controls;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const payload = {
      fullName: this.checkoutForm.value.fullName,
      email: this.checkoutForm.value.email,
      phone: this.checkoutForm.value.phone,
      address: this.checkoutForm.value.address,
      city: this.checkoutForm.value.city,
      postalCode: this.checkoutForm.value.postalCode,
      paymentMethod: this.checkoutForm.value.paymentMethod,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    this.orderService.createOrder(payload).subscribe({
      next: (response: CreateOrderResponse) => {
        this.cartService.clearCart();
        this.isSubmitting = false;
        this.router.navigate(['/order-success', response.id]);
      },
      error: (err: any) => {
        console.error('Order creation failed:', err);
        console.error('Backend error body:', err?.error);
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to place order. Please try again.';
      }
    });
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}