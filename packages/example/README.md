The code used for this example:

```js
import { remoteHello as remoteHello102 } from "https://nonpm.io/@no-npm/example@1.0.2";

const version = "2.0.0";

function remoteHello() {
  return `Remote hello world from version ${version}\n${remoteHello102()}`;
}

export { remoteHello, version };

```

And the demo code:
```html 
<html>
  <head>
    <script type="module">
      import { remoteHello } from './index.js';

      document.getElementById('versions').append(remoteHello());
    </script>
  </head>
  <body>
    <h1>Version history:</h1>
    <pre id="versions"></pre>
  </body>
</html>
```


[See the demo in action here.](https://www.nonpm.io/@no-npm/example/2.0.0/index.html)
