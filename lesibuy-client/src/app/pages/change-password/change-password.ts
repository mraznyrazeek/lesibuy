import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isSubmitting = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  showConfirmModal = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  get passwordChecks() {
    const password = this.formData.newPassword || '';

    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  }

  get passwordScore(): number {
    const checks = this.passwordChecks;
    return Object.values(checks).filter(Boolean).length;
  }

  get passwordStrength(): string {
    const score = this.passwordScore;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  }

  get passwordStrengthClass(): string {
    const score = this.passwordScore;
    if (score <= 2) return 'strength-weak';
    if (score <= 4) return 'strength-medium';
    return 'strength-strong';
  }

  isFormValid(): boolean {
    const checks = this.passwordChecks;

    return !!this.formData.currentPassword.trim() &&
      !!this.formData.newPassword.trim() &&
      !!this.formData.confirmPassword.trim() &&
      checks.minLength &&
      checks.uppercase &&
      checks.lowercase &&
      checks.number &&
      checks.special &&
      this.formData.newPassword === this.formData.confirmPassword;
  }

  openConfirmModal(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.formData.currentPassword.trim()) {
      this.errorMessage = 'Current password is required.';
      return;
    }

    if (!this.formData.newPassword.trim()) {
      this.errorMessage = 'New password is required.';
      return;
    }

    if (!this.formData.confirmPassword.trim()) {
      this.errorMessage = 'Please confirm your new password.';
      return;
    }

    if (!this.passwordChecks.minLength ||
        !this.passwordChecks.uppercase ||
        !this.passwordChecks.lowercase ||
        !this.passwordChecks.number ||
        !this.passwordChecks.special) {
      this.errorMessage = 'New password does not meet the required rules.';
      return;
    }

    if (this.formData.newPassword !== this.formData.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    if (this.formData.currentPassword === this.formData.newPassword) {
      this.errorMessage = 'New password must be different from current password.';
      return;
    }

    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    if (this.isSubmitting) return;
    this.showConfirmModal = false;
  }

  submitChangePassword(): void {
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword({
      currentPassword: this.formData.currentPassword,
      newPassword: this.formData.newPassword,
      confirmNewPassword: this.formData.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showConfirmModal = false;
        this.successMessage = response?.message || 'Password updated successfully.';
        this.clearForm();

        setTimeout(() => {
          this.successMessage = '';
        }, 3500);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.showConfirmModal = false;
        this.errorMessage = err?.error?.message || 'Failed to update password.';
      }
    });
  }

  clearForm(): void {
    this.formData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}