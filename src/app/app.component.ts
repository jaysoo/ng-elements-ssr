import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Hello!</h1>
    <h2>Normal component:</h2>
    <app-child></app-child>
    <h2>Custom element (without attribute):</h2>
    <child-element></child-element>
    <h2>Custom element (with attribute):</h2>
    <child-element foo="override"></child-element>
  `,
  styles: [],
})
export class AppComponent {
  title = 'ng-elements-ssr';
}
