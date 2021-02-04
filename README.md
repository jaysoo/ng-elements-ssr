# Angular 11 Example for Elements + SSR

```
yarn
yarn dev:ssr
```

Then browse to localhost:4200. Disable JS and check that the HTML is correct.

## Downgrading to `@angular/elements` 10

Run `yarn patch` to pull elements at version 10, and see that SSR works correctly with elements.

Run `yarn unpatch` to go back to 11.1.2 and see that default input values are overridden as `undefined`.
