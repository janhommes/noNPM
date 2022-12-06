import { NestFactory } from "@nestjs/core";
import { Command } from "commander";
import { AppModule, CONFIG, NoNpmConfig } from "@no-npm/nonpm";
import * as _ from "lodash";
import { version } from "../package.json";
import { LogLevel } from "@nestjs/common";

const program = new Command();
const envOptions: Partial<NoNpmConfig> = {};
const envKeys = Object.keys(process.env).filter((key) =>
  key.startsWith("NONPM")
);

envKeys.forEach((key) => {
  const value = process.env[key];
  const configKey = _.tail(key.split("_")).join("_");
  _.set(envOptions, configKey, value);
});

async function bootstrap(config: NoNpmConfig, logging: LogLevel[]) {
  const app = await NestFactory.create(await AppModule.register(config), {
    cors: config.CORS,
    logger: logging,
  });
  await app.listen(config.PORT);
}

const defaultConfig = { ...CONFIG, ...envOptions };

program
  .version(version)
  .command("start")
  .description("Start the noNPM server.")
  .option(
    "-p, --port <port>",
    "Define the port to run at.",
    `${defaultConfig.PORT}`
  )
  .option(
    "--storage <path>",
    "The path where the packages are stored.",
    defaultConfig.STORAGE
  )
  .option(
    "--registry <name>",
    "Define the registry to use. Defaults to https://registry.npmjs.org/.",
    defaultConfig.REGISTRY
  )
  .option(
    "--serveAll",
    "Serves all npm packages, even if they do not have a serve property set.",
    JSON.parse(`${defaultConfig.SERVE_ALL}`)
  )
  .option(
    "--defaultApp <name>",
    "Define a application that is served via the base path. By default the @no-npm/web package is used.",
    defaultConfig.DEFAULT_APP
  )
  .option(
    "--cors",
    "Set this to false, to disable cors (default: `true`).",
    JSON.parse(`${defaultConfig.CORS}`)
  )
  .option(
    "--logging [log...]",
    "Define the log-level. Possible values are: log,error,warn,debug,verbose",
    "log,error,warn,debug"
  )
  .action((options) => {
    const config: NoNpmConfig = {
      PORT: options.port,
      STORAGE: options.storage,
      REGISTRY: options.registry,
      SERVE_ALL: options.serveAll,
      DEFAULT_APP: options.defaultApp,
      CORS: options.cors,
      SEARCH: defaultConfig.SEARCH,
    };
    const logging: LogLevel[] = options.logging.split(',');
    bootstrap(config, logging);
  })
  .parse(process.argv);
