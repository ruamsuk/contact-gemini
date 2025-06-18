import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastContainer } from './component/toast-container.component';
import { AuthService } from './services/auth.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastContainer, ConfirmDialogComponent, RouterLink],
  template: `
    <app-toast-container/>
    <header class="bg-white shadow-md">
      <nav class="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div class="text-2xl font-bold text-blue-600" (click)="router.navigate(['/'])" style="cursor: pointer;">
          📞 ContactApp
        </div>

        @if (authService.currentUser()) {
          <div class="flex items-center gap-4">
            <a routerLink="/profile" class="text-sm text-gray-600 hover:text-blue-600 hover:underline"
               title="Go to profile">
              Welcome, {{ authService.currentUser()?.email }}
            </a>
            <button (click)="logout()"
                    class="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        }
      </nav>
    </header>
    <router-outlet></router-outlet>
    <app-confirm-dialog/>
  `,
  styles: [],
})
export class App {
  public authService = inject(AuthService);
  public router = inject(Router);

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

}
