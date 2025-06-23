export interface Contact {
  email: string;
  id?: string; // Firestore, will set optional
  userId: string;
  name: string;
  phone: string;
  photoURL?: string; // Optional, can be null
}
