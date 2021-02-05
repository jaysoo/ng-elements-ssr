import { DOCUMENT } from '@angular/common';
import { Inject, NgModule } from '@angular/core';

import { CustomElementsRegistry, patchDocument } from './custom_elements_shim';
import { CUSTOM_ELEMENTS } from './custom-elements.token';

@NgModule({
  providers: [
    {
      provide: CUSTOM_ELEMENTS,
      useClass: CustomElementsRegistry,
    },
  ],
})
export class CustomElementsModule {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(CUSTOM_ELEMENTS) private customElements: CustomElementRegistry
  ) {
    // Add custom elements shim on the default doc and the current document.
    patchDocument(this.document, this.customElements);
  }
}
