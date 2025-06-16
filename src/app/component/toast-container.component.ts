import { Component, inject, OnInit } from '@angular/core';
import { ToastMessage, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    <div class="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      @for (msg of messages; track msg.id) {
        <div [class]="getToastClass(msg.type).base" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="relative flex items-center p-2">

            <!-- Icon -->
            <span class="mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-6 h-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="getIconPath(msg.type)"/>
          </svg>
        </span>

            <!-- Message Text -->
            <span class="block">{{ msg.text }}</span>

            <!-- Close Button - มุมขวาบน -->
            <button
              (click)="removeMessage(msg.id)"
              class="absolute -top-2.5 -right-1 text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ToastContainer implements OnInit {
  toastService = inject(ToastService);
  messages: ToastMessage[] = [];

  ngOnInit(): void {
    this.toastService.getMessages().subscribe(mes => {
      this.messages = mes;
    });
  }

  getToastClass(type: string): { base: string } {
    const base = 'px-4 py-2 rounded shadow-lg text-white transition-opacity duration-300 ease-in-out';
    switch (type) {
      case 'success':
        return {base: `${base} bg-green-500`};
      case 'error':
        return {base: `${base} bg-red-500`};
      case 'info':
        return {base: `${base} bg-blue-500`};
      case 'warning':
        return {base: `${base} bg-yellow-500`};
      default:
        return {base};
    }
  }

  getIconPath(type: string): string {
    switch (type) {
      case 'success':
        return 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';
      case 'info':
        return 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z';
      case 'warning':
        return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';
      default:
        return '';
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'success':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`;
      case 'error':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>`;
      case 'info':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>`;
      case 'warning':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>`;
      default:
        return '';
    }
  }

  removeMessage(id: number): void {
    this.toastService.remove(id);
  }
}
