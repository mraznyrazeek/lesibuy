import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, AuthResponse, UpdateProfileRequest } from '../../services/auth.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css'
})
export class MyProfile implements OnInit {
  profileForm!: FormGroup;
  currentUser: AuthResponse | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      postalCode: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || ''
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load profile.';
      }
    });
  }

  startEdit(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.currentUser) {
      this.profileForm.patchValue({
        fullName: this.currentUser.fullName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        address: this.currentUser.address || '',
        city: this.currentUser.city || '',
        postalCode: this.currentUser.postalCode || ''
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateProfileRequest = this.profileForm.value;

    this.authService.updateProfile(payload).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully.';
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile.';
      }
    });
  }

  get f() {
    return this.profileForm.controls;
  }
}