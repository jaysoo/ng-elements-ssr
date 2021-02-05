import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { ComponentNgElementStrategyFactory } from './custom-component-factory-strategy';
export const registerElement = (
  customElementRegistry: any,
  injector: Injector,
  component: Type<any>,
  selector: string
) => {
  if (!customElementRegistry.get(selector)) {
    const customElement = createCustomElement(component, {
      injector,
      strategyFactory: new ComponentNgElementStrategyFactory(
        component,
        injector
      ),
    });
    customElementRegistry.define(selector, customElement);
  }
};
