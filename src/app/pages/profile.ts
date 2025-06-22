import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { DialogService } from '../shared/services/dialog';

@Component({
  selector: 'app-profile',
  imports: [
    NgClass,
    TitleCasePipe
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">User Profile</h1>

        <div class="bg-white p-6 rounded-xl shadow-md dark:bg-gray-800">

          <div class="flex flex-col items-center mb-6">
            <div class="relative">
              <img class="h-36 w-36 rounded-full object-cover ring-4 ring-blue-200"
                   [src]="authService.currentUser()?.photoURL || 'https://i.pravatar.cc/150?u=default'"
                   alt="Profile Picture">

              @if (isUploading()) {
                <div class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                  <div class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                </div>
              }
              <button (click)="fileInput.click()"
                      class="absolute bottom-0 -right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Change profile picture">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-6 h-6 text-gray-700 dark:text-gray-200">
                  <path
                    d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                </svg>
              </button>
            </div>
            <input #fileInput id="profile-upload" type="file" class="hidden" (change)="onFileSelected($event)"
                   accept="image/png, image/jpeg">
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</label>
              <p class="text-lg text-gray-800 dark:text-gray-200">{{ authService.currentUser()?.displayName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
              <p class="text-lg text-gray-800 dark:text-gray-200">{{ authService.currentUser()?.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
              <p class="text-sm text-gray-500 font-mono dark:text-gray-400">{{ authService.currentUser()?.uid }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
              <p class="text-lg font-semibold"
                 [ngClass]="authService.currentUser()?.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-800 dark:text-gray-200'">
                {{ authService.currentUser()?.role | titlecase }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</label>
              <p class="text-lg"
                 [ngClass]="authService.currentUser()?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'">
                {{ authService.currentUser()?.emailVerified ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>

        </div>

        <div class="mt-8 border-t-2 border-red-300 dark:border-red-800/50 pt-6">
          <h2 class="text-xl font-semibold text-red-700 dark:text-red-500">Danger Zone</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">These actions are permanent and cannot be undone.</p>
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
    <!--<main class="container mx-auto p-4 md:p-8">
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
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-500">Role</label>
            <p class="text-lg text-green-500">{{ authService.currentUser()?.role }}</p>
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
    </main>-->
  `,
  styles: ``
})
export class Profile {
  public authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService); // Assuming ToastService is provided in the app
  public router = inject(Router);
  private loadingService = inject(LoadingService);

  isUploading = signal(false);

  /**
   * ถูกเรียกเมื่อผู้ใช้เลือกไฟล์รูปภาพใหม่
   * @param event - อีเวนต์ที่เกิดจากการเลือกไฟล์
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      console.log('No file selected');
      return;
    }

    const file = input.files[0];
    this.isUploading.set(true);
    // ไม่จำเป็นต้องใช้ Global spinner เพราะเรามี spinner เฉพาะจุดแล้ว
    // this.loadingService.show();

    try {
      // 1. เรียก Service ให้อัปโหลดไฟล์ และรอเอา URL กลับมา
      const downloadUrl = await this.authService.uploadProfileImage(file);

      // 2. เรียก Service ให้อัปเดต URL ในโปรไฟล์
      await this.authService.updateProfilePicture(downloadUrl);

      // อาจจะแสดง Toast แจ้งว่าสำเร็จ
      console.log('Profile picture updated successfully!');

    } catch (error) {
      console.error('Error during file upload or profile update:', error);
      // อาจจะแสดง Toast แจ้งข้อผิดพลาด
    } finally {
      // 3. ไม่ว่าจะสำเร็จหรือล้มเหลว ก็ให้ปิดสถานะ uploading
      this.isUploading.set(false);
      // this.loadingService.hide();
      input.value = ''; // เคลียร์ค่าใน input file เพื่อให้เลือกไฟล์เดิมซ้ำได้
    }
  }

  /**
   * จัดการการลบบัญชีผู้ใช้
   * @returns {Promise<void>}
   */
  async deleteUserAccount(): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'Delete Your Account',
      message: 'Are you absolutely sure? This action is irreversible and all your contacts will be deleted.'
    });

    if (confirmed) {
      this.loadingService.show(); // ใช้ Global Spinner สำหรับ Action ที่สำคัญนี้
      this.authService.deleteAccount()
        .then(() => {
          this.router.navigate(['/login']);
        })
        .catch(err => {
          console.error('Failed to delete account', err);
        })
        .finally(() => {
          this.loadingService.hide();
        });
    }
  }

  // async deleteUserAccount(): Promise<void> {
  //   const confirmed = await this.dialogService.open({
  //     title: 'Delete Your Account',
  //     message: 'Are you absolutely sure? This action is irreversible and all your contacts will be deleted.'
  //   });
  //
  //   if (confirmed) {
  //     this.authService.deleteAccount()
  //       .then(() => {
  //         this.toastService.show('Account deleted successfully.', 'success');
  //         this.router.navigate(['/login']);
  //       })
  //       .catch(err => {
  //         console.error('Failed to delete account', err);
  //         this.toastService.show('Error: Could not delete account. Please try logging out and back in.', 'error');
  //       });
  //   }
  // }
}
