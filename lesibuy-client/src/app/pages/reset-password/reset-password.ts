import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  token = '';

  isSubmitting = false;
  resetCompleted = false;
  errorMessage = '';

  resetForm;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.formBuilder.nonNullable.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordsMatchValidator
      }
    );
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.email || !this.token) {
      this.errorMessage =
        'This password reset link is invalid or incomplete.';
    }
  }

  get newPassword() {
    return this.resetForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.resetForm.controls.confirmPassword;
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmation = control.get('confirmPassword')?.value;

    return password === confirmation
      ? null
      : { passwordsDoNotMatch: true };
  }

  submit(): void {
    this.errorMessage = '';

    if (
      this.resetForm.invalid ||
      !this.email ||
      !this.token
    ) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: this.newPassword.value
      })
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.resetCompleted = true;
          this.resetForm.disable();
        },
        error: (error) => {
          console.error('Password reset failed:', error);

          this.errorMessage =
            error.error?.message ??
            'The reset link is invalid or has expired. Please request a new one.';
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  requestNewLink(): void {
    this.router.navigate(['/forgot-password']);
  }
}