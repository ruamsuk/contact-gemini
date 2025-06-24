import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-900  p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">Register</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="displayName" class="block text-gray-600 dark:text-gray-400 font-medium mb-2">Display
              name</label>
            <input type="text" id="displayName" formControlName="displayName"
                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:bg-gray-950">
          </div>
          <div class="mb-4">
            <label for="email" class="block text-gray-600 dark:text-gray-400 font-medium mb-2">Email</label>
            <input type="email" id="email" formControlName="email"
                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:bg-gray-950">
          </div>
          <div class="mb-6">
            <label for="password" class="block text-gray-600 dark:text-gray-400 font-medium mb-2">Password</label>
            <input type="password" id="password" formControlName="password"
                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:bg-gray-950">
          </div>

          @if (errorMessage) {
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span class="block sm:inline">{{ errorMessage }}</span>
            </div>
          }

          <div class="flex items-start justify-center">
            @if (loading()) {
              <button type="button"
                      class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed"
              >
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </button>
            } @else {
              <button type="submit" [disabled]="loginForm.invalid" [ngClass]="{'btn-disabled': loginForm.invalid}"
                      class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150">
                Login
              </button>
            }
          </div>
        </form>
        <p class="text-center mt-6 text-gray-600">
          Already have an account?
          <a routerLink="/login" class="text-blue-600 hover:underline">Sign in here</a>
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);

    this.errorMessage = null;
    const credentials = {
      displayName: this.loginForm.value.displayName,
      email: this.loginForm.value.email,
      pass: this.loginForm.value.password
    };
    this.authService.register(credentials)
      .then(() => {
        this.router.navigate(['/login'], {queryParams: {verification: 'sent'}});
      })
      .catch(error => {
        // จัดการ error ที่อาจเกิดขึ้น เช่น อีเมลซ้ำ
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'This email address is already in use.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
        console.error('Registration error:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.toastService.show(this.errorMessage, 'error');
      }).finally(() => {
      this.loading.set(false);
    });
  }
}
