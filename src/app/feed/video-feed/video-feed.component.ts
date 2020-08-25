import { Component, Input } from '@angular/core';
import { Video } from '../../models/video';
import { Util } from '../../util';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-feed',
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.scss'],
})
export class VideoFeedComponent {
  @Input() public videos: Video[] = [];
  @Input() public isSmallScreen: boolean = true;

  constructor(private sanitizer: DomSanitizer) {}

  public openLink(id: string): void {
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, this.isSmallScreen);
  }

  public getEmbeddedLink(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  }
}
