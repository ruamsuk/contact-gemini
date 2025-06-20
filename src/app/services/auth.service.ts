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
  User,
  UserCredential
} from '@angular/fire/auth';
import { doc, Firestore, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { from, of, switchMap } from 'rxjs';

// ++ สร้าง Interface สำหรับข้อมูล User ของเรา ++
export interface AppUser extends User {
  role?: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore = inject(Firestore); // ใช้ Firestore ในการดึงข้อมูลผู้ใช้

  // สร้าง Signal เพื่อเก็บสถานะผู้ใช้ปัจจุบัน
  public currentUser = toSignal<AppUser | null>(
    authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // ++ ถ้ามี user, ไปดึงข้อมูล role จาก collection 'users' ++
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            switchMap(docSnapshot => {
              if (docSnapshot.exists()) {
                return of({...user, role: docSnapshot.data()['role']} as AppUser);
              } else {
                // ถ้าไม่มีข้อมูลใน Firestore (อาจจะยังไม่ถูกสร้าง), คืนค่า user ปกติ
                return of(user as AppUser);
              }
            })
          );
        } else {
          // ถ้าไม่มี user, คืนค่า null
          return of(null);
        }
      })
    )
  );

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
    let createdUser: User;

    return createUserWithEmailAndPassword(this.auth, credentials.email, credentials.pass)
      .then((userCredential: UserCredential) => {
        createdUser = userCredential.user;
        // 1. สร้าง Document ใน collection 'users'
        const userDocRef = doc(this.firestore, `users/${createdUser.uid}`);
        return setDoc(userDocRef, {
          uid: createdUser.uid,
          email: createdUser.email,
          displayName: credentials.displayName,
          role: 'user', // ++ กำหนด role เริ่มต้นเป็น 'user' ++
          createdAt: serverTimestamp()
        });
      })
      .then(() => {
        // 3. ส่งอีเมลยืนยัน
        return sendEmailVerification(createdUser);
      })
      .then(() => {
        // 4. บังคับ Logout เพื่อให้ผู้ใช้ต้องยืนยันอีเมลก่อนเข้าสู่ระบบ
        return signOut(this.auth);
      });
  }

  // ++ เพิ่มเมธอดสำหรับการยืนยันอีเมล ++
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
