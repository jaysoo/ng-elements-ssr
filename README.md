# Issue: Angular 11 Example for Elements + SSR

This is a reproduction repo to demonstrate an issue with SSR and Angular Elements.

## Problem

When you set a default value to an input as follows:

```
class MyComponent {
  @Input() foo = 'default value';
}
```

Register this component as a custom element `my-element`, and use it without providing the `foo` attribute.

```
<my-element />
```

Then during SSR the `foo` input will be set to `undefined`, but it is correctly set as `'default value'` in the browser.

## Running the app

```
yarn
yarn dev:ssr
```

Then browse to localhost:4200. Disable JS and see that the HTML is incorrect.

## Workaround

To "fix" this issue, we can provide a custom strategy when creating the custom component.

Open up (`register-element.ts`)[./src/lib/custom-elements/register-element.ts] and uncomment the `strategyFactory` option.

Run the server again `yarn dev:ssr` and see that the HTML is now correct.

### Why does this work?

In the `initializeInputs` method of the custom strategy class, we try to read from `this.initialInputValues` but if it is undefined, then we fallback to `this.componentRef.instance[propName]`.

```
this.setInputValue(
  propName,
  this.initialInputValues.get(propName) ??
    this.componentRef.instance[propName]
);
```

For some reason, the `initialInputValues` map does not have the default value we set on the component class.
