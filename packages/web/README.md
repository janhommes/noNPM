# noNPM Web UI

This is the Web UI of [noNPM.io](noNPM.io). The base package can be found [here](https://www.npmjs.com/package/@no-npm/nonpm) and the CLI for local usage can be found [here](https://www.npmjs.com/package/@no-npm/cli).

## Use locally with the cli:

If you run noNPM locally, you get this package as the web-ui. You can try this by using:

```
npx @no-npm/cli
```

You can point the default route to your package by using the CLI option `--defaultApp`:


```
npx @no-npm/cli --defaultApp <your-package-name>
```

Using your own registry allows you to use private packages:

```
npx @no-npm/cli  --registry http://localhost:4111
```


## Changelog
06.12.2022 - Updated README.md and added 

