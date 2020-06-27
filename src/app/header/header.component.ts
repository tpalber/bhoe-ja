import { Component } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { AboutComponent } from '../shared/about/about.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public title: string = 'BHOE JA';

  constructor(private bottomSheet: MatBottomSheet) {}

  public openAboutSheet(): void {
    const config: MatBottomSheetConfig = {
      // panelClass: 'width: 50px',
    };
    this.bottomSheet.open(AboutComponent, config);
  }
}
