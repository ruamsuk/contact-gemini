import { inject, Injectable } from '@angular/core';
import { authState } from '@angular/fire/auth';
import { addDoc, collection, collectionData, deleteDoc, doc, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { db } from '../../../firebase.config';
import { Contact } from '../models/contact.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private authService = inject(AuthService);
  private contactsCollection = collection(db, 'contacts');

  /**
   *  Retrieves contacts from Firestore, filtered by the authenticated user's ID.
   *  If no user is authenticated, it returns an empty array.
   *  @returns An Observable of an array of contacts.
   * */
  getContacts(): Observable<Contact[]> {
    return authState(this.authService['auth']).pipe(
      switchMap(user => {
        if (!user) {
          return of([]); // Return an empty array if no user is authenticated,
          // return new Observable<Contact[]>(subscriber => {
          //   subscriber.next([]);
          //   subscriber.complete();
          // });
        }
        // Filter contacts by user ID
        const contactQuery = query(
          this.contactsCollection,
          where('userId', '==', user.uid)
        );
        return collectionData(contactQuery, {idField: 'id'}) as Observable<Contact[]>;
      })
    );
    // Alternatively, if you want to return all contacts without filtering by user ID:
    // return collectionData(this.contactsCollection, {idField: 'id'}) as Observable<Contact[]>;
  }

  /**
   *  Adds a new contact to Firestore.
   * */
  addContact(contact: Omit<Contact, 'id' | 'userId'>) {
    // console.log('%c[Service] 1. Received contact data from component:', 'color: blue; font-weight: bold;', contact);

    const user = this.authService.currentUser();
    // console.log('%c[Service] 2. Current user object:', 'color: blue; font-weight: bold;', user);

    if (!user) {
      // console.error('[Service] Error: User is not logged in. Cannot save.');
      return Promise.reject(new Error('User not logged in!'));
    }

    // console.log('%c[Service] 3. Current user UID:', 'color: blue; font-weight: bold;', user.uid);

    const newContact = {...contact, userId: user.uid};

    // !! log สำคัญที่สุด !!
    // console.log('%c[Service] 4. Final object being sent to Firestore:', 'color: green; font-weight: bold;', newContact);

    return addDoc(this.contactsCollection, newContact);
  }

  /**
   *  Deletes a contact from Firestore by its ID.
   * */
  deleteContact(id: string) {
    const contactDoc = doc(this.contactsCollection, id);
    return deleteDoc(contactDoc);
  }

  /**
   *  Updates an existing contact in Firestore.
   * */
  updateContact(contact: Contact) {
    // เพื่อแก้ปัญหาไม่ให้ id ไม่ได้ใช้ในการอัพเดต
    // @ts-ignore
    const contactDoc = doc(this.contactsCollection, contact.id);
    const {id, ...dataWithoutId} = contact; // Remove id if present
    return updateDoc(contactDoc, dataWithoutId);
  }
}
