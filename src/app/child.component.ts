import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `<p>foo: {{ foo }}</p>`,
  styles: [],
})
export class ChildComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  _x = 'default';

  @Input() set foo(x) {
    console.log(`[ChildComponent] setter (curr=${x}, prev=${this._x})`);
    this._x = x;
  }

  get foo(): string {
    return this._x;
  }

  constructor() {
    console.log(`[ChildComponent] constructor (foo=${this.foo})`);
  }

  ngOnInit() {
    console.log(`[ChildComponent] ngOnInit (foo=${this.foo})`);
  }
}
