import {
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  Injector,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { registerElement } from '../lib/custom-elements/register-element';
import { ChildComponent } from './child.component';
import { CUSTOM_ELEMENTS } from '../lib/custom-elements/custom-elements.token';

export function getCustomElements() {
  return customElements;
}

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ChildComponent, AppComponent],
  imports: [BrowserModule.withServerTransition({ appId: 'serverApp' })],
  providers: [
    {
      provide: CUSTOM_ELEMENTS,
      useFactory: getCustomElements,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private injector: Injector,
    @Inject(CUSTOM_ELEMENTS) customElementsRegistry: CustomElementRegistry
  ) {
    registerElement(
      customElementsRegistry,
      injector,
      ChildComponent,
      'child-element'
    );
  }
}
