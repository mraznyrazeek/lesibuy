import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  forgotPasswordForm;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.controls.email;
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .forgotPassword(this.email.value.trim())
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          /* generic message. Do not reveal whetherthe email address exists in the database */
          this.successMessage =
            'If an account exists for that email, a password reset link has been sent.';

          this.forgotPasswordForm.reset();
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          /* For security, use the same generic response even if the email does not exist */
          this.successMessage =
            'If an account exists for that email, a password reset link has been sent.';
        }
      });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}