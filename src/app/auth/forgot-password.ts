import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password</h2>
        <p class="text-center text-gray-500 mb-8">Enter your email to receive a reset link.</p>

        @if (successMessage()) {
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span class="block sm:inline">{{ successMessage() }}</span>
          </div>
        } @else {
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label for="email" class="block text-gray-600 font-medium mb-2">Email Address</label>
              <input type="email" id="email" formControlName="email"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            @if (errorMessage()) {
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline">{{ errorMessage() }}</span>
              </div>
            }

            <button type="submit" [disabled]="resetForm.invalid || loadingService.isLoading()" class="w-full ...">
              @if (loadingService.isLoading()) {
                <span>Sending...</span>
              } @else {
                <span>Send Reset Link</span>
              }
            </button>
          </form>
        }

        <p class="text-center mt-6 text-gray-600">
          Remember your password?
          <a routerLink="/login" class="text-blue-600 hover:underline">Back to Login</a>
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public loadingService = inject(LoadingService);

  resetForm: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.loadingService.show();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.resetForm.value.email;

    this.authService.resetPassword(email)
      .then(() => {
        // เพื่อความปลอดภัย เราจะไม่ยืนยันว่าอีเมลนี้มีในระบบหรือไม่
        this.successMessage.set('If an account with this email exists, a password reset link has been sent.');
        this.resetForm.disable(); // ปิดฟอร์มหลังจากส่งสำเร็จ
      })
      .catch(error => {
        // แสดง error message ทั่วไป เพื่อไม่ให้ข้อมูลรั่วไหล
        this.errorMessage.set('An error occurred. Please try again later.');
        console.error('Password reset error:', error);
      })
      .finally(() => {
        this.loadingService.hide();
      });
  }
}
