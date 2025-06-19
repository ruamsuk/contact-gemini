import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  // สร้าง Signal เพื่อเก็บสถานะผู้ใช้ปัจจุบัน
  private authState$ = authState(this.auth);
  public currentUser = toSignal(this.authState$);

  async login(credentials: { email: string, pass: string }): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, credentials.email, credentials.pass)
      .then((userCredential: UserCredential) => {
        // ++ ตรวจสอบสถานะการยืนยันอีเมล ++
        if (!userCredential.user.emailVerified) {
          // ถ้ายังไม่ยืนยัน, บังคับ logout และโยน error กลับไป
          signOut(this.auth);
          return Promise.reject({code: 'auth/email-not-verified'});
        }
        // ถ้าผ่าน, คืนค่า userCredential กลับไปตามปกติ
        return userCredential;
      });
  }

  async register(credentials: { email: string, pass: string, displayName: string }): Promise<void> {
    let createdUser: UserCredential['user'];

    const userCredential = await createUserWithEmailAndPassword(this.auth, credentials.email, credentials.pass);
    createdUser = userCredential.user;
    await updateProfile(createdUser, {
      displayName: credentials.displayName
    });
    await sendEmailVerification(createdUser);
    return await signOut(this.auth);
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
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
