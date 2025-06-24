import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { collection, doc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Contact } from '../models/contact.model';
import { AuthService } from '../services/auth.service';
import { ContactsService } from '../services/contacts.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { DialogService } from '../shared/services/dialog';

@Component({
  selector: 'app-contact-page.component',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
    <!--New template for dark/light -->
    <main class="container mx-auto p-4 md:p-8">
      <div class="flex justify-between items-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">My Contacts</h1>
        <button (click)="onAddNew()"
                class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
          + Add New
        </button>
      </div>

      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search
              Contacts</label>
            <div class="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                [(ngModel)]="searchTerm">
              @if (searchTerm()) {
                <button (click)="clearSearch()"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        title="Clear search">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by Name</label>
            <div class="flex gap-2">
              <button (click)="setSort('asc')"
                      class="w-full py-2 px-4 rounded-lg text-sm"
                      [class.bg-blue-600]="sortDirection() === 'asc'"
                      [class.text-white]="sortDirection() === 'asc'"
                      [class.bg-gray-200]="sortDirection() !== 'asc'"
                      [class.dark:bg-gray-700]="sortDirection() !== 'asc'">
                A-Z ↓
              </button>

              <button (click)="setSort('desc')"
                      class="w-full py-2 px-4 rounded-lg text-sm"
                      [class.bg-blue-600]="sortDirection() === 'desc'"
                      [class.text-white]="sortDirection() === 'desc'"
                      [class.bg-gray-200]="sortDirection() !== 'desc'"
                      [class.dark:bg-gray-700]="sortDirection() !== 'desc'">
                Z-A ↑
              </button>

              <button (click)="setSort('none')" title="Clear sort"
                      class="py-2 px-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                ✖
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        @if (loadingService.isLoading()) {
          <div class="flex justify-center items-center p-8">
          </div>
        } @else {
          <div class="space-y-4">
            @for (contact of paginatedContacts(); track contact.id) {
              <div
                class="bg-white p-5 rounded-xl shadow-lg flex items-center justify-between transition-transform hover:scale-105 dark:bg-gray-800">
                <div class="flex items-center gap-4">
                  <!-- ถ้า ?? ค่าทางซ้ายต้องเป็น null ถ้าค่าทางซ้ายเป็น '' ต้องใช้ || -->
                  <img
                    class="h-12 w-12 rounded-full object-cover"
                    [src]="contact.photoURL || 'https://i.pravatar.cc/150?u=' + contact.id"
                    alt="Contact Avatar">
                  <div>
                    <p class="font-semibold text-lg text-gray-800 dark:text-gray-200">{{ contact.name }}</p>
                    <p class="text-gray-500 dark:text-gray-400">{{ contact.email }}</p>
                    <p class="text-gray-500 dark:text-gray-400">{{ contact.phone }}</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <button (click)="onEdit(contact)"
                          class="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit Contact">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"/>
                    </svg>
                  </button>
                  <button (click)="onDelete(contact)"
                          class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Delete Contact">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="bg-white p-8 rounded-xl shadow-lg text-center dark:bg-gray-800">
                <p class="text-gray-500 dark:text-gray-400">No contacts found. Try adjusting your search or add a new
                  contact!</p>
              </div>
            }
          </div>

          @if (totalPages() > 1) {
            <div class="mt-8 flex justify-center items-center gap-4">
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                      class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                Previous
              </button>
              <span class="text-sm text-gray-700 dark:text-gray-300">Page {{ currentPage() }}
                of {{ totalPages() }}</span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                Next
              </button>
            </div>
          }
        }
      </div>
    </main>
    <!-- New Modal for upload images -->
    @if (isModalOpen()) {
      <div (click)="closeModal()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-8 rounded-xl shadow-2xl z-50 w-full max-w-md mx-4 dark:bg-gray-800">
          <div class="flex justify-between items-center mb-6">
            @if (isEditing()) {
              <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Edit Contact</h2>
            } @else {
              <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Add New Contact</h2>
            }
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">

            <div class="flex flex-col items-center mb-6">
              <img class="h-24 w-24 rounded-full object-cover ring-4 ring-blue-200"
                   [src]="imagePreviewUrl() || 'https://i.pravatar.cc/150?u=new_contact'"
                   alt="Contact Picture Preview">
              <label for="contact-image-upload"
                     class="mt-4 px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-200 cursor-pointer dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Select Picture
              </label>
              <input id="contact-image-upload" type="file" class="hidden" (change)="onContactImageSelected($event)"
                     accept="image/png, image/jpeg">
            </div>
            <div class="mb-4">
              <label for="name" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Name</label>
              <input type="text" id="name" formControlName="name" class="w-full ...">
            </div>
            <div class="mb-4">
              <label for="email" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Email</label>
              <input type="email" id="email" formControlName="email" class="w-full ...">
            </div>
            <div class="mb-6">
              <label for="phone" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Phone</label>
              <input type="tel" id="phone" formControlName="phone" class="w-full ...">
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
              <button type="button" (click)="closeModal()" class="bg-gray-200 ...">Cancel</button>
              <button type="submit" [disabled]="contactForm.invalid" class="bg-blue-600 ...">
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
    <!-- End new modal template -->

    <!--@if (isModalOpen()) {
      <div (click)="closeModal()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-8 rounded-xl shadow-2xl z-50 w-full max-w-md mx-4 dark:bg-gray-800">
          <div class="flex justify-between items-center mb-6">
            @if (isEditing()) {
              <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Edit Contact</h2>
            } @else {
              <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Add New Contact</h2>
            }
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label for="name" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Name</label>
              <input type="text" id="name" formControlName="name"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="mb-4">
              <label for="email" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Email</label>
              <input type="email" id="email" formControlName="email"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="mb-6">
              <label for="phone" class="block text-gray-600 font-medium mb-2 dark:text-gray-300">Phone</label>
              <input type="tel" id="phone" formControlName="phone"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
              <button type="button" (click)="closeModal()"
                      class="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button type="submit" [disabled]="contactForm.invalid"
                      class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50">
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
    }-->
    <!-- End new template -->

    <!--  <main class="container mx-auto p-4 md:p-8">
        <div class="flex justify-between items-center mb-10">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-300">My Contacts</h1>
          <button (click)="onAddNew()"
                  class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
            + Add New
          </button>
        </div>

        &lt;!&ndash; Search and sort &ndash;&gt;
        <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Search
                Contacts</label>
              <div class="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or email..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [(ngModel)]="searchTerm"
                >
                @if (searchTerm()) {
                  <button
                    (click)="clearSearch()"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    title="Clear search">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sort by Name</label>
              <div class="flex  gap-2">
                <button (click)="setSort('asc')"
                        class="w-full py-2 px-4 rounded-lg text-sm"
                        [class.bg-blue-600]="sortDirection() === 'asc'"
                        [class.text-white]="sortDirection() === 'asc'"
                        [class.bg-gray-200]="sortDirection() !== 'asc'">
                  A-Z ↓
                </button>

                <button (click)="setSort('desc')"
                        class="w-full py-2 px-4 rounded-lg text-sm"
                        [class.bg-blue-600]="sortDirection() === 'desc'"
                        [class.text-white]="sortDirection() === 'desc'"
                        [class.bg-gray-200]="sortDirection() !== 'desc'">
                  Z-A ↑
                </button>
                <button (click)="setSort('none')" title="Clear sort" class="py-2 px-3 rounded-lg bg-gray-200">✖</button>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6"> -- ไม่ต้องใช้ส่วนนี้ มันจะแสดงสปินเนอร์จาก service แทน --
          @if (loadingService.isLoading()) {
            <div class="flex justify-center items-center p-8">
              <div class="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
              <span class="ml-4 text-gray-600 dark:text-gray-400">Loading Contacts...</span>
            </div>
          }
        </div>
        &lt;!&ndash; End of Search and sort &ndash;&gt;
        &lt;!&ndash; Contacts list &ndash;&gt;
        <div class="space-y-4">
          @for (contact of paginatedContacts(); track contact.id) {
            <div
              class="bg-white p-5 rounded-xl shadow-lg flex items-center justify-between transition-transform hover:scale-105">
              <div class="flex items-center gap-4">
                <img class="h-12 w-12 rounded-full object-cover"
                     [src]="'https://i.pravatar.cc/150?u=' + contact.id"
                     alt="Contact Avatar">
                &lt;!&ndash;<div
                  class="bg-blue-100 text-blue-600 font-bold rounded-full h-12 w-12 flex items-center justify-center text-xl">
                  {{ contact.name.charAt(0).toUpperCase() }}
                </div>&ndash;&gt;
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

        &lt;!&ndash; Paginator &ndash;&gt;
        @if (totalPages() > 1) {
          <div class="mt-8 flex justify-center items-center gap-4">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>

            <span class="text-sm text-gray-700">
          Page {{ currentPage() }} of {{ totalPages() }}
        </span>

            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        }
      </main>

      &lt;!&ndash; Modal &ndash;&gt;
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
      }-->
  `,
  styles: ``
})
export class ContactPageComponent {
  private contactService = inject(ContactsService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);
  private fb = inject(FormBuilder);
  public loadingService = inject(LoadingService);
  public auth = inject(AuthService);

  /**
   *  ใช้ toSignal เพื่อแปลง Observable เป็น Signal
   *  เราจะใช้ tap เพื่อจัดการสถานะ loading
   *  เราจะใช้ catchError เพื่อจัดการข้อผิดพลาด
   * */
  contacts = toSignal(
    (this.contactService.getContacts() as Observable<Contact[]>)
      .pipe(
        tap((d: Contact[]) => {
          // this.loadingService.hide();
          console.log('Contacts stream has emitted.');
          console.log(JSON.stringify(d, null, 2));

        }),
        catchError(err => {
          this.toastService.show('Error loading contacts: ' + err.message, 'error');
          console.error('Error loading contacts:', err);
          return throwError(() => err);
        }),
        tap(() => {
          this.loadingService.hide();
        })
      ),
    {
      initialValue: []
    });

  selectedContact: WritableSignal<Contact | null> = signal(null);
  isEditing: Signal<boolean> = computed(() => !!this.selectedContact());
  isModalOpen: WritableSignal<boolean> = signal(false);

  // ++ เพิ่ม Signals สำหรับ Search และ Sort ++
  searchTerm = signal('');
  sortDirection = signal<'asc' | 'desc' | 'none'>('none');

  // ++ เพิ่ม Signals สำหรับ Pagination ++
  currentPage = signal(1);
  itemsPerPage = signal(5); // <-- กำหนดจำนวนรายการต่อหน้าตรงนี้

  // ++ Signals ใหม่สำหรับจัดการไฟล์ใน Modal ++
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);


  // ++ เมธอดใหม่เมื่อมีการเลือกไฟล์ ++
  onContactImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      // สร้าง URL ชั่วคราวสำหรับแสดงภาพตัวอย่างทันที
      this.imagePreviewUrl.set(URL.createObjectURL(file));
    }
  }

  // vvv Refactor Computed Signal vvv
  // 1. เปลี่ยนชื่อ computed เดิมเป็น sortedAndFilteredContacts
  sortedAndFilteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const direction = this.sortDirection();
    let contactsToShow = [...this.contacts()];

    if (term) {
      contactsToShow = contactsToShow.filter(contact =>
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term)
      );
    }
    if (direction === 'asc') {
      contactsToShow.sort((a, b) => a.name.localeCompare(b.name));
    } else if (direction === 'desc') {
      contactsToShow.sort((a, b) => b.name.localeCompare(a.name));
    }
    return contactsToShow;
  });

  // 2. สร้าง computed ใหม่สำหรับแบ่งหน้าโดยเฉพาะ
  paginatedContacts = computed(() => {
    const fullList = this.sortedAndFilteredContacts();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return fullList.slice(startIndex, endIndex);
  });

  // 3. สร้าง computed สำหรับคำนวณจำนวนหน้าทั้งหมด
  totalPages = computed(() => {
    return Math.ceil(this.sortedAndFilteredContacts().length / this.itemsPerPage());
  });

  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
    this.loadingService.show();
  }

  // ++ เพิ่มเมธอดสำหรับควบคุม Pagination ++
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  setSort(direction: 'asc' | 'desc' | 'none'): void {
    this.sortDirection.set(direction);
  }

  // ++ เพิ่มเมธอดสำหรับล้างการค้นหา ++
  clearSearch(): void {
    this.searchTerm.set('');
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) return;
    this.loadingService.show();

    let contactData = {...this.contactForm.value};

    try {
      // --- 1. ตรวจสอบและอัปโหลดรูปภาพก่อน ---
      const fileToUpload = this.selectedFile();
      if (fileToUpload) {
        // หา ID ของ contact ที่จะใช้อ้างอิง
        // ถ้าเป็นการสร้างใหม่, ให้สร้าง ID ขึ้นมาก่อน
        const contactId = this.selectedContact()?.id || doc(collection(this.contactService['firestore'], '_')).id;

        contactData.photoURL = await this.contactService.uploadContactImage(fileToUpload, contactId); // เพิ่ม URL ของรูปภาพเข้าไปในข้อมูลที่จะบันทึก
      }

      // --- 2. จัดการข้อมูลซ้ำ (ถ้าต้องการ) ---
      // (โค้ดส่วนเช็คข้อมูลซ้ำยังคงทำงานได้ แต่เราอาจจะต้องปรับ Logic เล็กน้อยถ้าจะรวมกับการอัปโหลดรูป)
      // ...

      // --- 3. บันทึกข้อมูลลง Firestore ---
      if (this.isEditing() && this.selectedContact()) {
        const updatedContact = {...this.selectedContact()!, ...contactData};
        await this.contactService.updateContact(updatedContact);
      } else {
        await this.contactService.addContact(contactData);
      }

      this.closeModal();

    } catch (error) {
      console.error('Error during save process:', error);
      // this.toastService.show('Failed to save contact.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  /* async onSubmit(): Promise<void> {
     if (this.contactForm.invalid) return;

     // เราไม่จำเป็นต้องดึง user ที่นี่ เพราะ Service จะเป็นคนจัดการเอง
     const formData = this.contactForm.value;
     // console.log(formData);
     // --- ตรวจสอบข้อมูลซ้ำ ---
     const check = await this.contactService.checkEmailExists(formData.email);
     if (check.exists && check.existingContact?.id !== this.selectedContact()?.id) {
       // ถ้าเจอข้อมูลซ้ำ และไม่ใช่เอกสารตัวเดียวกับที่กำลังแก้ไขอยู่
       const confirmed = await this.dialogService.open({
         title: 'Duplicate Contact Found',
         message: `A contact with email <strong>${formData.email}</strong> already exists for <strong>${check.existingContact?.name}</strong>. Do you want to overwrite the existing contact?`
       });

       if (confirmed) {
         // ผู้ใช้เลือก "Overwrite"
         const contactToUpdate = {...check.existingContact, ...formData};
         await this.contactService.updateContact(contactToUpdate);
         this.closeModal();
         return; // จบการทำงาน
       } else {
         // ผู้ใช้เลือก "Cancel"
         return; // จบการทำงาน
       }
     }

     // Original Add/Update Logic
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
   }*/

  onAddNew(): void {
    this.selectedContact.set(null);
    this.contactForm.reset();
    this.selectedFile.set(null); // รีเซ็ตไฟล์ที่เลือก
    this.imagePreviewUrl.set(null); // รีเซ็ตภาพตัวอย่าง
    this.isModalOpen.set(true);
  }

  onEdit(contact: Contact): void {
    this.selectedContact.set(contact);
    this.contactForm.patchValue(contact);
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(contact.photoURL || null); // แสดงภาพเดิม
    this.isModalOpen.set(true);
  }

  async onDelete(contact: Contact): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete <strong>${contact.name}</strong>? This action cannot be undone.`
    });

    if (confirmed && contact.id) {
      this.contactService.deleteContact(contact.id)
        .then(() => this.toastService.show('Contact deleted successfully!', 'success'))
        .catch(err => this.toastService.show('Error deleting contact: ' + err.message, 'error'));
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.contactForm.reset();
    this.selectedContact.set(null);
  }
}
