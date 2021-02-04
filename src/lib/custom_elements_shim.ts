/* tslint:disable */
import { Injectable } from '@angular/core';
/**
 * A very simplified CustomElementsRegistry to maintain tag to constructor
 * mapping
 */
@Injectable()
export class CustomElementsRegistry {
  private registry = new Map<string, Function>();
  private reverseRegistry = new Map<Function, string>();
  private resolveMap = new Map<string, Function>();

  define(name: string, constructor: Function) {
    this.registry.set(name, constructor);
    this.reverseRegistry.set(constructor, name);
    const el = this.resolveMap.get(name);
    if (el) {
      nextTick(() => {
        el();
      });
    }
  }

  get(name: string) {
    return this.registry.get(name);
  }

  whenDefined(name: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolveMap.set(name, resolve);
    });
  }
}

// Should match domino/lib/MutationConstants.js
enum MutationType {
  VALUE = 1, // The value of a Text, Comment or PI node changed
  ATTR = 2, // A new attribute was added or an attribute value and/or prefix
  // changed
  REMOVE_ATTR = 3, // An attribute was removed
  REMOVE = 4, // A node was removed
  MOVE = 5, // A node was moved
  INSERT = 6, // A node (or a subtree of nodes) was inserted
}

interface DominoMutationEvent {
  type: MutationType;
  target: HTMLElement & { [k: string]: Function | undefined };
  node?: HTMLElement & { [k: string]: Function | undefined };
  attr?: { data: string; name: string };
}

function nextTick(fn: () => void) {
  Promise.resolve(null).then(fn);
}

/**
 * Patch a Document object to support upgrading known custom elements when they
 * are created.
 */
export function patchDocument(
  doc: Document,
  customElements: CustomElementRegistry
) {
  function recursivelyRoot(node: Node) {
    // Only Element Nodes can be Custom Elements
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    // tslint:disable:no-any check for optional 'connectedCallback'.
    const ctor = customElements.get((node as HTMLElement).localName);
    if (ctor) {
      // Create instance of CustomElement to transfer properties onto Node
      const instance = new ctor();

      // Transfer properties from instance to the node
      for (const k in instance) {
        if (!node.hasOwnProperty(k)) {
          node[k] = instance[k];
        }
      }

      // Transfer prototype from instance to Node
      (Object as any).setPrototypeOf(node, ctor.prototype);

      // Call initial round of change detection before connectedCallback
      if (typeof node['attributeChangedCallback'] === 'function') {
        ctor.observedAttributes.forEach((attr) => {
          if ((node as Element).hasAttribute(attr)) {
            node['attributeChangedCallback'].call(
              node,
              attr,
              undefined,
              (node as Element).getAttribute(attr)
            );
          }
        });
      }

      // Call connectedCallback if existing
      if (typeof (node as any)['connectedCallback'] === 'function') {
        nextTick(() => (node as any)['connectedCallback'].call(node));
      }
    }
    // tslint:enable:no-any

    for (let kid: any = node.firstChild; kid !== null; kid = kid.nextSibling) {
      recursivelyRoot(kid);
    }
  }

  function recursivelyUproot(node: Node) {
    // Only Element Nodes can be Custom Elements
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    // check for optional 'disconnectedCallback'.
    if (typeof (node as HTMLElement)['disconnectedCallback'] === 'function') {
      nextTick(() => (node as HTMLElement)['disconnectedCallback'].call(node));
    }

    for (
      let kid: any = (node as HTMLElement).firstChild;
      kid !== null;
      kid = kid.nextSibling
    ) {
      recursivelyUproot(kid);
    }
  }

  // tslint:disable-next-line:no-any add a new property to document.
  if ((doc as any).__cePatched__) {
    return;
  }

  // Hook up to Domino mutation handler to listen to mutation events and call
  // the appropriate custom elements callback.
  // tslint:disable-next-line:no-any Domino internals
  (doc as any)._setMutationHandler((event: DominoMutationEvent) => {
    const target = event.target;
    const node = event.node as any;
    switch (event.type) {
      case MutationType.INSERT:
        recursivelyRoot(node);
        break;
      case MutationType.REMOVE:
        recursivelyUproot(node);
        break;
      case MutationType.ATTR:
      case MutationType.REMOVE_ATTR:
        const attr = event.attr;
        let clss;
        if (target) {
          clss = target.__ceClass__;
        }
        if (!attr) {
          throw new Error('No attribute specified for mutation');
        }
        const newValue =
          event.type === MutationType.ATTR ? attr.data : undefined;

        // tslint:disable:no-any Check for optional `observedAttributes`
        if (
          clss &&
          (clss as any)['observedAttributes'].indexOf(attr.name) > -1
        ) {
          const callback = target['attributeChangedCallback'];
          if (typeof callback === 'function') {
            /* TODO(viks): old value is always undefined since Domino doesn't
             * provide that. But Angular Elements doesn't use old value.
             */
            callback.call(target, attr.name, undefined, newValue);
          }
        }
        // tslint:enable:no-any
        break;
      default:
      // Do nothing.
    }
  });

  // Take over createElement to upgrade nodes known in the
  // `CustomElementsRegistry`.
  // tslint:disable-next-line
  const createElement = doc.createElement;
  // tslint:disable-next-line
  doc.createElement = (name: string) => {
    const node: HTMLElement & { [k: string]: {} } = createElement.call(
      doc,
      name
    );

    const clss = customElements.get(name);
    if (clss) {
      // Upgrade node to custom element.
      const instance = new clss();

      // Copy all properties of the custom element on top of the existing ones
      // in the node.
      for (const k in instance) {
        if (!node.hasOwnProperty(k)) {
          node[k] = instance[k];
        }
      }
      // Store the Custom Elements class to check the observedAttributes static
      // field on attribute change.
      node.__ceClass__ = clss;

      // Watch for when the node is rooted to call `connectedCallback`.
      node._roothook = () => {
        if (typeof node['connectedCallback'] === 'function') {
          nextTick(() => (node['connectedCallback'] as Function).call(node));
        }
      };

      // Change the prototype of the node to that of the custom element.
      // tslint:disable-next-line:no-any
      (Object as any).setPrototypeOf(node, clss.prototype);
    }
    return node;
  };

  // tslint:disable-next-line:no-any
  (doc as any).__cePatched__ = true;
}
