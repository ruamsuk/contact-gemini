import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../models/contact.model';
import { ContactsService } from '../services/contacts.service';
import { ToastService } from '../services/toast.service';
import { DialogService } from '../shared/services/dialog';

@Component({
  selector: 'app-contact-page.component',
  imports: [
    ReactiveFormsModule
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <div class="flex justify-between items-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">My Contacts</h1>
        <button (click)="onAddNew()"
                class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
          + Add New
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
              <button (click)="onDelete(contact)"
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
      <div (click)="closeModal()"
           class="fixed inset-0 bg-black/45 z-40 flex items-center justify-center transition-opacity duration-300">
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
  `,
  styles: ``
})
export class ContactPageComponent {
  private contactService = inject(ContactsService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);
  private fb = inject(FormBuilder);

  contacts = toSignal(this.contactService.getContacts(), {initialValue: []});
  selectedContact: WritableSignal<Contact | null> = signal(null);
  isEditing: Signal<boolean> = computed(() => !!this.selectedContact());
  isModalOpen: WritableSignal<boolean> = signal(false);

  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;

    // เราไม่จำเป็นต้องดึง user ที่นี่ เพราะ Service จะเป็นคนจัดการเอง
    const formData = this.contactForm.value;

    // console.log(formData);

    const operation = this.isEditing() && this.selectedContact()
      ? this.contactService.updateContact({...this.selectedContact()!, ...formData})
      // ตรวจสอบว่าการเรียกใช้ addContact เป็นแบบนี้
      // คือส่งไปแค่ข้อมูลจากฟอร์ม
      : this.contactService.addContact(formData);

    operation.then(() => {
      this.toastService.show('Contact saved successfully!', 'success');
      this.closeModal();
    }).catch(err => {
      // Error จะแสดงที่นี่
      this.toastService.show('Error saving contact' + err.message, 'error');
      console.error('Error saving contact:', err);
    });
  }

  // onSubmit(): void {
  //   if (this.contactForm.invalid) return;
  //   const user = this.contactService['authService'].currentUser();
  //   if (!user) return;
  //
  //   const formData = this.contactForm.value;
  //   const operation = this.isEditing() && this.selectedContact()
  //     ? this.contactService.updateContact({...this.selectedContact()!, ...formData})
  //     : this.contactService.addContact({...formData});
  //
  //   operation.then(() => {
  //     this.closeModal();
  //   }).catch(err => console.error('Error saving contact:', err));
  // }

  onAddNew(): void {
    this.selectedContact.set(null);
    this.contactForm.reset();
    this.isModalOpen.set(true);
  }

  onEdit(contact: Contact): void {
    this.selectedContact.set(contact);
    this.contactForm.patchValue(contact);
    this.isModalOpen.set(true);
  }

  async onDelete(contact: Contact): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete <strong>${contact.name}</strong>? This action cannot be undone.`
    });

    if (confirmed && contact.id) {
      this.contactService.deleteContact(contact.id)
        .then(() => console.log('Contact deleted!'))
        .catch(err => console.error(err));
    }
  }

  // onDelete(id: string | undefined): void {
  //   if (id && confirm('Are you sure you want to delete this contact?')) {
  //     this.contactService.deleteContact(id)
  //       .catch(err => console.error('Error deleting contact:', err));
  //   }
  // }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.contactForm.reset();
    this.selectedContact.set(null);
  }
}
