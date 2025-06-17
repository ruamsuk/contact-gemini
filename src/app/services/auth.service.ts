import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
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

  logout() {
    return signOut(this.auth);
  }
}
