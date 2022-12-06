# noNPM
The **n**ot **o**nly NPM project helps you to run micro frontends directly from a npm package. It adds the ability to serve the package content. Any package on npm only needs the `serve` object in the `package.json`:

```json
{
  "serve": "public/remoteEntry.js"
}
```

If the noNPM.io URL is now used as an import, the `public/remoteEntry.js` is served:

```js
import { remoteHello } from 'https://nonpm.io/@no-npm/example';
console.log(remoteHello); // run in a browser it will print "hello from remote"
``` 

## Why?
While NPM is great, with upcoming micro frontends trend, NPM does not serve the necessary of remote modules. While one could argue, that anyone could serve simply static files, the ability of NPM to manage versions, tagging and disallow reusing versions is exactly what is needed to run a micro frontend architecture. The following examples all resolve different versions of the `@no-npm/example` package:

```js
import { remoteHello } from 'https://nonpm.io/@no-npm/example@1.0.1';
import { remoteHello } from 'https://nonpm.io/@no-npm/example@^1.0.1';
import { remoteHello } from 'https://nonpm.io/@no-npm/example@~1.0.1';
import { remoteHello } from 'https://nonpm.io/@no-npm/example@latest';
import { remoteHello } from 'https://nonpm.io/@no-npm/example@beta';
``` 

## Production usage
We recommend a self hosting of noNPM to ensure your own SLAs. You can even point it to a private registry (e.g. verdaccio) to build up your own+npm hosted micro frontend architecture.

```
npx @no-npm/cli --registry http://localhost:4111
```

You can always browse your local supported packages by opening the web interface locally `http://localhost:3000`. See all options of the `@no-npm/cli` by running `--help`.

## Extend
The `serve` entry of your PR can be extended to add additional information about the micro frontend:
```json
{
  "serve": {
    "url": "public/remoteEntry.js",
    "demo": "public/demo/index.html"
  }
}
```