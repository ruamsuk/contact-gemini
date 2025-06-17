import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="email" class="block text-gray-600 font-medium mb-2">Email</label>
            <input type="email" id="email" formControlName="email"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-6">
            <label for="password" class="block text-gray-600 font-medium mb-2">Password</label>
            <input type="password" id="password" formControlName="password"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          @if (errorMessage) {
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span class="block sm:inline">{{ errorMessage }}</span>
            </div>
          }

          <button type="submit" [disabled]="loginForm.invalid"
                  class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
            Log In
          </button>
        </form>
        <p class="text-center mt-6 text-gray-600">
          Don't have an account?
          <a routerLink="/register" class="text-blue-600 hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage = null;
    const credentials = {
      email: this.loginForm.value.email,
      pass: this.loginForm.value.password
    };
    this.authService.login(credentials)
      .then(() => {
        this.toastService.show('Login successful!', 'success');
        this.router.navigate(['/contacts']);
      })
      .catch(error => {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.toastService.show(this.errorMessage, 'error');
        console.error('Login error:', error);
      });
  }
}
