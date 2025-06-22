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
  User,
  UserCredential
} from '@angular/fire/auth';
import { doc, Firestore, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { from, of, switchMap } from 'rxjs';
import { ToastService } from './toast.service';

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
  private storage: Storage = inject(Storage); // ใช้ Storage สำหรับการอัปโหลดรูปภาพ
  private toastService = inject(ToastService); // ใช้สำหรับแสดงข้อความ Toast

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
                const firestoreData = docSnapshot.data();
                // ++ สร้าง AppUser โดยรวมข้อมูลจาก Firestore และ Auth ++
                const combineUser = {
                  ...user,
                  role: firestoreData['role'],
                  photoURL: firestoreData['photoURL'] || user.photoURL, // ใช้ photoURL จาก Firestore ถ้ามี
                } as AppUser;
                return of(combineUser);
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

  /**
   * อัปโหลดไฟล์รูปภาพไปยัง Firebase Storage
   * @param file - ไฟล์ที่ต้องการอัปโหลด
   * @returns Promise ที่จะคืนค่าเป็น URL ของไฟล์ที่อัปโหลดแล้ว
   */
  async uploadProfileImage(file: File): Promise<string> {
    const user = this.currentUser();
    if (!user) throw new Error('Authentication Error: User not logged in.');

    // สร้าง Path ที่จะเก็บไฟล์ เช่น /profile_images/USER_UID/profile.jpg
    const filePath = `profile_images/${user.uid}/${file.name}`;
    const storageRef = ref(this.storage, filePath);

    // ทำการอัปโหลดไฟล์
    await uploadBytes(storageRef, file);

    // ดึง URL ของไฟล์ที่เพิ่งอัปโหลดไป
    return await getDownloadURL(storageRef);
  }

  /**
   * อัปเดต photoURL ของผู้ใช้ทั้งใน Auth และ Firestore
   * @param photoURL - URL ของรูปภาพใหม่
   */
  async updateProfilePicture(photoURL: string): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('[AuthService] Update failed: User not logged in.');
      this.toastService.show('Authentication Error: User not logged in.', 'error');
      return Promise.reject('Authentication Error: User not logged in');
    }

    console.log(`%c[AuthService] 1. Starting profile picture update for user: ${user.uid}`, 'color: yellow; font-weight: bold;');
    console.log(`%c[AuthService] 2. New photoURL to be saved:`, 'color: yellow; font-weight: bold;', photoURL);


    // 1. อัปเดตโปรไฟล์ใน Firebase Authentication
    return updateProfile(user, {photoURL: photoURL})
      .then(() => {
        console.log(`%c[AuthService] 3. Successfully updated Firebase Auth profile.`, 'color: green; font-weight: bold;');

        // 2. อัปเดต URL ใน Firestore 'users' collection (เหมือนเดิม)
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        console.log(`%c[AuthService] 4. Preparing to update Firestore document at path: ${userDocRef.path}`, 'color: blue; font-weight: bold;');

        return setDoc(userDocRef, {photoURL: photoURL}, {merge: true});
      })
      .then(() => {
        console.log(`%c[AuthService] 5. Successfully updated Firestore 'users' collection.`, 'color: green; font-weight: bold;');
        this.toastService.show('Profile picture updated successfully.', 'success');
      })
      .catch(error => {
        console.error(`%c[AuthService] ERROR during profile update process:`, 'color: red; font-weight: bold;', error);
        this.toastService.show('Failed to update profile picture.', 'error');
        throw error;
      });
  }
}
