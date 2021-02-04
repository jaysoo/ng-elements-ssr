import {Injector, Type} from '@angular/core';
import {createCustomElement} from '@angular/elements';

export const registerElement = (
  customElementRegistry: any,
  injector: Injector,
  component: Type<any>,
  selector: string
) => {
  if (!customElementRegistry.get(selector)) {
    const customElement = createCustomElement(component, {
      injector
    });
    customElementRegistry.define(selector, customElement);
  }
};
