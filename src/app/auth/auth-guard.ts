import { inject } from '@angular/core';
import { authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // เราจะใช้ currentUser signal ในรูปแบบที่ทันสมัย
  // แต่เนื่องจาก guard อาจทำงานก่อน signal จะมีค่า เราจะใช้ authState observable โดยตรง
  return authState(authService['auth']).pipe(
    map(user => {
      if (user) {
        return true; // ถ้ามี user (ล็อกอินแล้ว) ให้เข้าได้
      } else {
        // ถ้าไม่มี user ให้ redirect ไปหน้า login
        return router.createUrlTree(['/login']);
      }
    })
  );
};
