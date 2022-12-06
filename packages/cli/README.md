# noNPM cli

Run noNPM locally with:

```
npx @no-npm/cli
```


You can point noNPM to another registry:


```
npx @no-npm/cli --registry http://localhost:4111
```

All packages will be stored in the `--storage` folder which is by default `.noNPM`.

## All options

You can run it with the `--help` flag to see all options of the cli:
```
Usage:  start [options]

Start the noNPM server.

Options:
  -p, --port <port>    Define the port to run at. (default: "3000")
  --storage <path>     The path where the packages are stored. (default: "./.noNPM")
  --registry <name>    Define the registry to use. Defaults to https://registry.npmjs.org/. (default: "https://registry.npmjs.org/")
  --serveAll           Serves all npm packages, even if they do not have a serve property set. (default: false)
  --defaultApp <name>  Define a application that is served via the base path. By default the @no-npm/web package is used. (default: "@no-npm/web")
  --cors               Set this to false, to disable cors (default: `true`). (default: true)
  --logging [log...]   Define the log-level. Possible values are: log,error,warn,debug,verbose (default: "log,error,warn,debug")
  -h, --help           display help for command
  
```