import { Component, inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading',
  imports: [],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[9999]">
        <div class="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-blue-600"></div>
      </div>
    }
  `,
  styles: ``
})
export class Loading {
  public loadingService = inject(LoadingService);
}
