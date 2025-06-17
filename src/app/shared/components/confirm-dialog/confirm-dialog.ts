import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DialogService } from '../../services/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  template: `
    @if (dialogService.isOpen()) {
      <div (click)="onCancel()"
           class="fixed inset-0 bg-black/45 z-40 flex items-center justify-center transition-opacity duration-300">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-8 rounded-xl shadow-2xl z-50 w-full max-w-sm mx-4 text-center">

          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>

          <h3 class="text-xl font-semibold text-gray-900 mt-5">
            {{ dialogService.dialogData()?.title }}
          </h3>

          <div class="mt-2">
            <p class="text-sm text-gray-500" [innerHTML]="dialogService.dialogData()?.message"></p>
          </div>

          <div class="mt-8 flex justify-center gap-4">
            <button type="button" (click)="onCancel()"
                    class="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
              Cancel
            </button>
            <button type="button" (click)="onConfirm()"
                    class="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md">
              Confirm
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  public dialogService = inject(DialogService);

  onConfirm(): void {
    this.dialogService.confirm();
  }

  onCancel(): void {
    this.dialogService.cancel();
  }
}
