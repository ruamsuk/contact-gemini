import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { db } from '../../../firebase.config';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private contactsCollection = collection(db, 'contacts');

  /**
   *  Logic to fetch contacts from Firestore
   *  This method should return an observable or a promise
   *  that emits or resolves with the contacts data.
   *  For now, we just return the collection reference.
   * */
  getContacts() {
    return collectionData(this.contactsCollection, {idField: 'id'}) as Observable<Contact[]>;
  }

  /**
   *  Adds a new contact to Firestore.
   * */
  addContact(contact: Omit<Contact, 'id'>) {
    return addDoc(this.contactsCollection, contact);
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
