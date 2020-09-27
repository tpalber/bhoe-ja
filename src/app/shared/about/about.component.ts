import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { StorageService } from 'src/app/service/storage.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  public isDarkMode: boolean;

  constructor(private storageService: StorageService) {
    this.isDarkMode = this.storageService.getDarkMode();
  }

  public onDarkModeChange({ checked }: MatSlideToggleChange): void {
    this.isDarkMode = checked;
    this.storageService.toggleDarkMode(this.isDarkMode);
  }
}
