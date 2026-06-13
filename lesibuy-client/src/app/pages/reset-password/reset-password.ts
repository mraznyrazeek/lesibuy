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

function strongPasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value || '';

  const valid =
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  return valid ? null : { weakPassword: true };
}

function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return newPassword === confirmPassword
    ? null
    : { passwordsDoNotMatch: true };
}

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

  showNewPassword = false;
  showConfirmPassword = false;

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
            strongPasswordValidator
          ]
        ],
        confirmPassword: [
          '',
          Validators.required
        ]
      },
      {
        validators: passwordsMatchValidator
      }
    );
  }

  ngOnInit(): void {
    this.email =
      this.route.snapshot.queryParamMap.get('email') ?? '';

    this.token =
      this.route.snapshot.queryParamMap.get('token') ?? '';

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

  get passwordValue(): string {
    return this.newPassword.value || '';
  }

  get passwordChecks() {
    const password = this.passwordValue;

    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  }

  get passwordScore(): number {
    return Object
      .values(this.passwordChecks)
      .filter(Boolean)
      .length;
  }

  get passwordStrength(): string {
    const score = this.passwordScore;

    if (score <= 2) {
      return 'Weak';
    }

    if (score <= 4) {
      return 'Medium';
    }

    return 'Strong';
  }

  get passwordStrengthClass(): string {
    const score = this.passwordScore;

    if (score <= 2) {
      return 'strength-weak';
    }

    if (score <= 4) {
      return 'strength-medium';
    }

    return 'strength-strong';
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.resetCompleted = true;
          this.resetForm.disable();
        },
        error: error => {
          console.error(
            'Password reset failed:',
            error
          );

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