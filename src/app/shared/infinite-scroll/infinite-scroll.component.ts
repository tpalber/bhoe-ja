import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
})
export class InfiniteScrollComponent implements OnInit, OnDestroy {
  @Input()
  public isLoading: boolean | undefined;
  @Output()
  public scrolled: EventEmitter<void> = new EventEmitter();
  @ViewChild('anchor', { static: true })
  public anchor: ElementRef<HTMLElement> | undefined;

  public observer: IntersectionObserver | undefined;

  constructor(private host: ElementRef) {}

  public ngOnInit(): void {
    const options: IntersectionObserverInit = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
    };

    this.observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && !this.isLoading && this.scrolled.emit();
    }, options);

    if (this.anchor) {
      this.observer.observe(this.anchor.nativeElement);
    }
  }

  public ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private get element(): any {
    return this.host.nativeElement;
  }

  private isHostScrollable(): boolean {
    const style: any = window.getComputedStyle(this.element);
    return (
      style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll'
    );
  }
}
