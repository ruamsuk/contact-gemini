import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastContainer } from './component/toast-container.component';
import { AuthService } from './services/auth.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { Loading } from './shared/loading';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastContainer, ConfirmDialogComponent, RouterLink, Loading],
  template: `
    <app-toast-container/>
    <header class="bg-white shadow-md dark:bg-gray-800 dark:border-b dark:border-gray-700">
      <nav class="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          📞 ContactApp
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <button (click)="toggleTheme()"
                  class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Toggle theme">
            @if (isDarkMode()) {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                   class="w-6 h-6 text-yellow-400">
                <path fill-rule="evenodd"
                      d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.894 17.834a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM3 12a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 3 12ZM6.166 6.106a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.06-1.06l-1.59-1.591Z"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                   class="w-6 h-6 text-gray-700">
                <path fill-rule="evenodd"
                      d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5c0-1.25.21-2.447.6-3.565A.75.75 0 0 1 9.528 1.718Z"
                      clip-rule="evenodd"/>
              </svg>
            }
          </button>

          @if (authService.currentUser()) {
            <div class="flex items-center gap-2">
              <a routerLink="/profile"
                 class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                 title="Go to profile">
                <span>Welcome, {{ authService.currentUser()?.displayName || authService.currentUser()?.email }}</span>
                <img class="h-8 w-8 rounded-full object-cover"
                     [src]="authService.currentUser()?.photoURL || 'https://i.pravatar.cc/150?u=default'"
                     alt="My Profile Picture">
              </a>
              <button (click)="logout()"
                      class="bg-red-500 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-600 transition">
                Logout
              </button>
            </div>
          }
        </div>
      </nav>
    </header>

    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <router-outlet></router-outlet>
    </div>
    <app-confirm-dialog/>
    <app-loading/>
  `,
  styles: [],
})
export class App {
  public authService = inject(AuthService);
  public router = inject(Router);

  // 1. สร้าง signal เพื่อเก็บสถานะ dark mode
  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    // 2. สร้าง effect ที่จะทำงานทุกครั้งที่ isDarkMode เปลี่ยนแปลง
    effect(() => {
      const isDark = this.isDarkMode();
      // 2.1 บันทึกค่าล่าสุดลง localStorage
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      // 2.2 เพิ่ม/ลบ คลาส 'dark' ที่ <html> tag
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  // 3. เมธอดสำหรับสลับ theme
  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
  }

  // 4. เมธอดสำหรับอ่านค่า theme เริ่มต้นจาก localStorage
  private getInitialTheme(): boolean {
    if (typeof window !== 'undefined') {
      // เช็คค่าที่เคยบันทึกไว้
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // ถ้าไม่มี, ให้ใช้ค่าเริ่มต้นตาม theme ของ OS
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // ค่า default ถ้าทำงานบน server
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

}
