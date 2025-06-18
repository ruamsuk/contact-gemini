import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { DialogService } from '../shared/services/dialog';

@Component({
  selector: 'app-profile',
  imports: [
    NgClass
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>

        <div class="bg-white p-6 rounded-xl shadow-md">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-500">Email Address</label>
            <p class="text-lg text-gray-800">{{ authService.currentUser()?.email }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-500">User ID</label>
            <p class="text-sm text-gray-500 font-mono">{{ authService.currentUser()?.uid }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-500">Email Verified</label>
            <p class="text-lg"
               [ngClass]="{
                'text-green-600': authService.currentUser()?.emailVerified,
                'text-red-600': !authService.currentUser()?.emailVerified
              }">
              {{ authService.currentUser()?.emailVerified ? 'Yes' : 'No' }}
            </p>
          </div>
        </div>

        <div class="mt-8 border-t-2 border-red-300 pt-6">
          <h2 class="text-xl font-semibold text-red-700">Danger Zone</h2>
          <p class="text-sm text-gray-600 mt-1">These actions are permanent and cannot be undone.</p>
          <div class="mt-4">
            <button (click)="deleteUserAccount()"
                    class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800 transition duration-300">
              Delete My Account
            </button>
            <button (click)="router.navigate(['/'])"
                    class="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-800 transition duration-300 ml-2">
              Go Back to Home
            </button>
          </div>
        </div>

      </div>
    </main>
  `,
  styles: ``
})
export class Profile {
  public authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService); // Assuming ToastService is provided in the app
  public router = inject(Router);

  async deleteUserAccount(): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'Delete Your Account',
      message: 'Are you absolutely sure? This action is irreversible and all your contacts will be deleted.'
    });

    if (confirmed) {
      this.authService.deleteAccount()
        .then(() => {
          this.toastService.show('Account deleted successfully.', 'success');
          this.router.navigate(['/login']);
        })
        .catch(err => {
          console.error('Failed to delete account', err);
          this.toastService.show('Error: Could not delete account. Please try logging out and back in.', 'error');
        });
    }
  }
}
