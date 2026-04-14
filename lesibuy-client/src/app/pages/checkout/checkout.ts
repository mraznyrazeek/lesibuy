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
  total = 0;
  orderPlaced = false;
  isSubmitting = false;
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

      shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
      shippingCity: ['', [Validators.required]],
      shippingPostalCode: ['', [Validators.required, Validators.minLength(3)]],

      billingSameAsShipping: [true],

      billingAddress: [''],
      billingCity: [''],
      billingPostalCode: [''],

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
    this.handleBillingToggle();
  }

  get f() {
    return this.checkoutForm.controls;
  }

  loadProfileIntoCheckout(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.checkoutForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          shippingAddress: user.address || '',
          shippingCity: user.city || '',
          shippingPostalCode: user.postalCode || ''
        });
      },
      error: (err) => {
        console.error('Failed to load profile into checkout:', err);
      }
    });
  }

  handleBillingToggle(): void {
    this.checkoutForm.get('billingSameAsShipping')?.valueChanges.subscribe((same) => {
      const billingAddress = this.checkoutForm.get('billingAddress');
      const billingCity = this.checkoutForm.get('billingCity');
      const billingPostalCode = this.checkoutForm.get('billingPostalCode');

      if (same) {
        billingAddress?.clearValidators();
        billingCity?.clearValidators();
        billingPostalCode?.clearValidators();

        billingAddress?.setValue('');
        billingCity?.setValue('');
        billingPostalCode?.setValue('');
      } else {
        billingAddress?.setValidators([Validators.required, Validators.minLength(5)]);
        billingCity?.setValidators([Validators.required]);
        billingPostalCode?.setValidators([Validators.required, Validators.minLength(3)]);
      }

      billingAddress?.updateValueAndValidity();
      billingCity?.updateValueAndValidity();
      billingPostalCode?.updateValueAndValidity();
    });
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

      shippingAddress: this.checkoutForm.value.shippingAddress,
      shippingCity: this.checkoutForm.value.shippingCity,
      shippingPostalCode: this.checkoutForm.value.shippingPostalCode,

      billingSameAsShipping: this.checkoutForm.value.billingSameAsShipping,
      billingAddress: this.checkoutForm.value.billingAddress,
      billingCity: this.checkoutForm.value.billingCity,
      billingPostalCode: this.checkoutForm.value.billingPostalCode,

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
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to place order. Please try again.';
      }
    });
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}