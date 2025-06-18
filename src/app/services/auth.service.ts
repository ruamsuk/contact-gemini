import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  // สร้าง Signal เพื่อเก็บสถานะผู้ใช้ปัจจุบัน
  private authState$ = authState(this.auth);
  public currentUser = toSignal(this.authState$);

  login(credentials: { email: string, pass: string }) {
    return signInWithEmailAndPassword(this.auth, credentials.email, credentials.pass);
  }

  register(credentials: { email: string, pass: string }) {
    return createUserWithEmailAndPassword(this.auth, credentials.email, credentials.pass);
  }

  // ++ เพิ่มเมธอดสำหรับลบบัญชี ++
  deleteAccount(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      return Promise.reject(new Error('No user to delete.'));
    }
    return deleteUser(user);
  }

  logout() {
    return signOut(this.auth);
  }
}
