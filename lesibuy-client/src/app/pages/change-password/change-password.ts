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
  isSaving = false;

  formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  clearForm(): void {
    this.formData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  save(): void {
    if (
      !this.formData.currentPassword ||
      !this.formData.newPassword ||
      !this.formData.confirmPassword
    ) {
      alert('All fields are required.');
      return;
    }

    if (this.formData.newPassword !== this.formData.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    this.isSaving = true;

    this.authService.changePassword({
      currentPassword: this.formData.currentPassword,
      newPassword: this.formData.newPassword,
      confirmNewPassword: this.formData.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isSaving = false;
        alert(response.message);
        this.clearForm();
      },
      error: (error) => {
        this.isSaving = false;
        alert(error?.error?.message || 'Failed to change password.');
      }
    });
  }
}