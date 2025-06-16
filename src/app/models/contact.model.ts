export interface Contact {
  email: string;
  id?: string; // Optional, will be set by Firestore
  name: string;
  phone: string;
}
