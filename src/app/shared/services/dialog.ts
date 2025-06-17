import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

interface DialogData {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  // Signals สำหรับจัดการ State ของ Dialog
  isOpen = signal(false);
  dialogData = signal<DialogData | null>(null);

  // Subject สำหรับรอรับผลลัพธ์
  private resultSubject = new Subject<boolean>();

  // เมธอดหลักที่ Component อื่นจะเรียกใช้
  open(data: DialogData): Promise<boolean> {
    this.dialogData.set(data);
    this.isOpen.set(true);

    // คืนค่าเป็น Promise ที่จะ resolve เมื่อผู้ใช้กดปุ่ม
    return new Promise(resolve => {
      const sub = this.resultSubject.subscribe(result => {
        this.close();
        sub.unsubscribe();
        resolve(result);
      });
    });
  }

  // เมธอดที่ถูกเรียกจาก DialogComponent
  confirm(): void {
    this.resultSubject.next(true);
  }

  cancel(): void {
    this.resultSubject.next(false);
  }

  private close(): void {
    this.isOpen.set(false);
    this.dialogData.set(null);
  }
}
