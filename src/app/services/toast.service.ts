import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messages = new BehaviorSubject<ToastMessage[]>([]);

  getMessages() {
    return this.messages.asObservable();
  }

  show(text: string, type: ToastMessage['type'] = 'info') {
    const id = Date.now();
    const newMessage: ToastMessage = {id, text, type};
    const current = this.messages.getValue();
    this.messages.next([...current, newMessage]);

    // ลบหลังจากผ่านไป 3 วินาที
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: number) {
    const current = this.messages.getValue();
    this.messages.next(current.filter(msg => msg.id !== id));
  }
}
