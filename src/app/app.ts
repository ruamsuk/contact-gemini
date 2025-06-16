import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './component/toast-container.component';
import { Contact } from './models/contact.model';
import { ContactsService } from './services/contacts.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, ToastContainer],
  template: `

    <body class="bg-gray-100 font-sans">
    <div>
      <button (click)="showSuccess()">Show</button>
    </div>
    <main class="container mx-auto p-4 md:p-8">

      <div class="flex justify-between items-center mb-10">
        <h1 class="text-4xl font-bold text-gray-800">📞 Contact Manager</h1>
        <button (click)="onAddNew()"
                class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
          + Add New Contact
        </button>
      </div>


      <div class="space-y-4">
        @for (contact of contacts(); track contact.id) {
          <div
            class="bg-white p-5 rounded-xl shadow-lg flex items-center justify-between transition-transform hover:scale-105">
            <div class="flex items-center gap-4">
              <div
                class="bg-blue-100 text-blue-600 font-bold rounded-full h-12 w-12 flex items-center justify-center text-xl">
                {{ contact.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-lg text-gray-800">{{ contact.name }}</p>
                <p class="text-gray-500">{{ contact.email }}</p>
                <p class="text-gray-500">{{ contact.phone }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="onEdit(contact)"
                      class="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"/>
                </svg>
              </button>
              <button (click)="onDelete(contact.id)"
                      class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        } @empty {
          <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <p class="text-gray-500">No contacts found. Add one by clicking the button above!</p>
          </div>
        }
      </div>
    </main>

      @if (isModalOpen()) {
        <div (click)="closeModal()" class="fixed inset-0 bg-black/45 z-40 flex items-center justify-center">

          <div (click)="$event.stopPropagation()" class="bg-white p-8 rounded-xl shadow-2xl z-50 w-full max-w-md mx-4">

            <div class="flex justify-between items-center mb-6">
              @if (isEditing()) {
                <h2 class="text-2xl font-semibold text-gray-700">Edit Contact</h2>
              } @else {
                <h2 class="text-2xl font-semibold text-gray-700">Add New Contact</h2>
              }
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="mb-4">
                <label for="name" class="block text-gray-600 font-medium mb-2">Name</label>
                <input type="text" id="name" formControlName="name"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="mb-4">
                <label for="email" class="block text-gray-600 font-medium mb-2">Email</label>
                <input type="email" id="email" formControlName="email"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="mb-6">
                <label for="phone" class="block text-gray-600 font-medium mb-2">Phone</label>
                <input type="tel" id="phone" formControlName="phone"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" (click)="closeModal()"
                        class="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                  Cancel
                </button>
                <button type="submit" [disabled]="contactForm.invalid"
                        class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                  @if (isEditing()) {
                    <span>Update</span>
                  } @else {
                    <span>Save</span>
                  }
                </button>
              </div>
            </form>
          </div>

        </div>
      }
    </body>
    <app-toast-container/>
    <router-outlet/>

  `,
  styles: [],
})
export class App {
  private contactService = inject(ContactsService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // --- Signals for State Management ---
  contacts = toSignal(this.contactService.getContacts(), {initialValue: []});
  selectedContact: WritableSignal<Contact | null> = signal(null);
  isEditing: Signal<boolean> = computed(() => !!this.selectedContact());

  // ++ เพิ่ม Signal สำหรับควบคุม Modal ++
  isModalOpen: WritableSignal<boolean> = signal(false);

  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  showSuccess() {
    this.toastService.show('บันทึกสำเร็จ!', 'success');
  }

  onSubmit() {
    if (this.contactForm.invalid) return;

    const operation = this.isEditing() && this.selectedContact()
      ? this.contactService.updateContact({...this.selectedContact()!, ...this.contactForm.value})
      : this.contactService.addContact(this.contactForm.value);

    operation.then(() => {
      this.closeModal(); // ปิด Modal เมื่อบันทึกสำเร็จ
    }).catch(err => console.error('Error saving contact:', err));

    // if (this.isEditing() && this.selectedContact()) {
    //   // --- Update Logic ---
    //   const updatedContact: Contact = {...this.selectedContact()!, ...this.contactForm.value};
    //   this.contactService.updateContact(updatedContact)
    //     .then(() => this.cancelEdit())
    //     .catch(err => console.error('Error updating contact:', err));
    // } else {
    //   // --- Add Logic ---
    //   this.contactService.addContact(this.contactForm.value)
    //     .then(() => this.contactForm.reset())
    //     .catch(err => console.error('Error adding contact:', err));
    // }

  }

  onEdit(contact: Contact): void {
    this.selectedContact.set(contact);
    this.contactForm.patchValue(contact);
    this.isModalOpen.set(true); // เปิด Modal
  }

  onDelete(id: string | undefined): void {
    if (id && confirm('Are you sure you want to delete this contact?')) {
      this.contactService.deleteContact(id)
        .catch(err => console.error('Error deleting contact:', err));
    }
  }

  cancelEdit() {
    this.selectedContact.set(null);
    this.contactForm.reset();
  }

  // ++ เปลี่ยนชื่อเมธอดให้สื่อความหมายมากขึ้น ++
  closeModal() {
    this.isModalOpen.set(false);
    this.contactForm.reset();
    this.selectedContact.set(null);
  }

  // ++ เมธอดสำหรับเปิด Modal เพื่อ "เพิ่ม" รายชื่อใหม่ ++
  onAddNew() {
    this.selectedContact.set(null); // เคลียร์ contact ที่เลือกไว้ก่อนหน้า
    this.contactForm.reset();
    this.isModalOpen.set(true);
  }
}
