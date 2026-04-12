import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css'
})
export class MyProfile implements OnInit {
  currentUser: AuthResponse | null = null;
  editMode = false;
  isSaving = false;

  formData = {
    fullName: '',
    email: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      this.currentUser = user;

      if (user) {
        this.formData.fullName = user.fullName;
        this.formData.email = user.email;
      }
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.authService.setSession(user);

        this.formData.fullName = user.fullName;
        this.formData.email = user.email;
      },
      error: () => {
        console.error('Failed to load profile');
      }
    });
  }

  startEdit(): void {
    if (!this.currentUser) return;

    this.formData.fullName = this.currentUser.fullName;
    this.formData.email = this.currentUser.email;
    this.editMode = true;
  }

  cancelEdit(): void {
    if (!this.currentUser) return;

    this.formData.fullName = this.currentUser.fullName;
    this.formData.email = this.currentUser.email;
    this.editMode = false;
  }

  saveProfile(): void {
    const trimmedFullName = this.formData.fullName.trim();
    const trimmedEmail = this.formData.email.trim();

    if (!trimmedFullName || !trimmedEmail) {
      alert('Full Name and Email are required.');
      return;
    }

    this.isSaving = true;

    this.authService.updateProfile({
      fullName: trimmedFullName,
      email: trimmedEmail
    }).subscribe({
      next: (updatedUser) => {
        this.authService.setSession(updatedUser);
        this.currentUser = updatedUser;
        this.editMode = false;
        this.isSaving = false;
        alert('Profile updated successfully.');
      },
      error: (error) => {
        this.isSaving = false;
        alert(error?.error?.message || 'Failed to update profile.');
      }
    });
  }
}