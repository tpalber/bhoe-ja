import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Source, sourceListing, SourceType } from '../../models';
import { LocalStorageService } from '../../service/local-storage.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  public isDarkMode: boolean;
  public articleSources: Source[] = sourceListing.filter(
    (source) => source.type === SourceType.article
  );
  public videoSources: Source[] = sourceListing.filter(
    (source) => source.type === SourceType.video
  );

  constructor(private storageService: LocalStorageService) {
    this.isDarkMode = this.storageService.getDarkMode();
  }

  public onDarkModeChange({ checked }: MatSlideToggleChange): void {
    this.isDarkMode = checked;
    this.storageService.toggleDarkMode(this.isDarkMode);
  }
}
