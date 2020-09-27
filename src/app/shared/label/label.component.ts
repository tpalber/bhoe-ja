import { Component } from '@angular/core';

@Component({
  selector: 'app-label',
  styleUrls: ['./label.component.scss'],
  template: `
    <div class="label">
      <ng-content></ng-content>
    </div>
  `,
})
export class LabelComponent {
  constructor() {}
}
