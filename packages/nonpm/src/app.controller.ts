import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { existsSync, readdirSync } from 'fs';
import { readJson } from 'fs-extra';
import { extract, manifest } from 'pacote';
import { join } from 'path';
import { AppService } from './app.service';
import { NoNpmConfig } from './config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('CONFIG') private config: NoNpmConfig,
  ) {}

  @Get()
  redirectDefault(@Res() res: Response) {
    Logger.debug('Redirecting to default app');
    res.redirect(this.config.DEFAULT_APP);
  }

  @Get('/browse/health')
  health() {
    Logger.debug('Health status returned');
    return { ok: true };
  }

  @Get('/browse/search/:term')
  async findPackages(@Param('term') term) {
    Logger.debug(`Searching for term "${term}"`);
    return this.appService.search(term);
  }

  @Get('/browse/:scopeOrName/:name?/README.md')
  async getReadme(
    @Param('scopeOrName') scopeOrName: string,
    @Param('name') name,
    @Res() res: Response,
  ) {
    const {
      version,
      name: packageName,
      scope,
    } = await this.resolveVersionAndName(name, scopeOrName);
    const filePath = this.getPackageFilePath(scope, packageName, version);
    Logger.debug(`Browse readme on path: ${filePath}`);
    const filenames = readdirSync(join(this.config.STORAGE, filePath));

    const foundReadme = filenames.find((name) => /readme.md/gi.test(name));
    if (!foundReadme) {
      throw new HttpException(
        'There seems to be no README.md file in this project.',
        HttpStatus.NOT_FOUND,
      );
    }
    res.redirect('/' + filePath + '/' + foundReadme);
  }

  @Get('/browse/:scopeOrName/:name?')
  async browsePackage(
    @Param('scopeOrName') scopeOrName: string,
    @Param('name') name,
  ) {
    const {
      version,
      name: packageName,
      scope,
    } = await this.resolveVersionAndName(name, scopeOrName);
    const filePath = this.getPackageFilePath(scope, packageName, version);
    Logger.debug(`Browse package on path: ${filePath}`);
    return this.getPackageJson(filePath);
  }

  @Get('/:scopeOrName/:name?')
  async getPackage(
    @Param('scopeOrName') scopeOrName: string,
    @Param('name') name,
    @Res() res: Response,
  ): Promise<void> {
    const {
      version,
      name: packageName,
      scope,
      manifest,
    } = await this.resolveVersionAndName(name, scopeOrName);

    Logger.debug('Package resolved', scope, name, version);

    const filePath = this.getPackageFilePath(scope, packageName, version);
    const isKnown = this.checkIfKnown(filePath);

    if (isKnown) {
      Logger.debug('Package is known');
      const packageJson = await this.getPackageJson(filePath);
      res.redirect('/' + this.getServePath(packageJson, filePath));
      return;
    }
    const fullPackageName = this.getFullPackageName(
      scope,
      packageName,
      version,
    );
    const canBeServed = await this.checkIfCanBeServed(manifest);
    if (canBeServed) {
      Logger.debug('Package can be served');
      await this.extractForServing(fullPackageName, filePath);
      Logger.debug('Extracted for serving');
      const packageJson = await this.getPackageJson(filePath);
      Logger.debug('Package.json retrieved');
      this.appService.storeToDB(packageJson);
      Logger.debug('Data stored to data base');
      res.redirect('/' + this.getServePath(packageJson, filePath));
      Logger.debug('Redirected for static files.');
      return;
    } else {
      throw new HttpException(
        'This package does not support serving. Add `serve` to the package.json to support it.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  private getFullPackageName(
    scope: string,
    packageName: string,
    version: string,
  ) {
    return `${scope}${scope ? '/' : ''}${packageName}@${version}`;
  }

  private async checkIfCanBeServed(packageJson) {
    if (this.config.SERVE_ALL) {
      return true;
    }
    return !!packageJson.serve;
  }

  private async extractForServing(fullPackageName, filePath) {
    await extract(fullPackageName, join(this.config.STORAGE, filePath), {
      registry: this.config.REGISTRY,
    });
  }

  private getPackageFilePath(
    scope: string,
    packageName: string,
    version: string,
  ) {
    return join(scope, packageName, version);
  }

  private checkIfKnown(path: string) {
    const isKnown = existsSync(join(this.config.STORAGE, path, 'package.json'));
    return isKnown;
  }

  private getServePath(packageJson, path: string) {
    if (typeof packageJson.serve === 'string') {
      return join(path, packageJson.serve);
    }
    if (typeof packageJson.serve === 'object') {
      return join(path, packageJson.serve.url);
    }
    return join(
      path,
      packageJson.module ||
        packageJson.es2020 ||
        packageJson.esm2020 ||
        packageJson.main ||
        'index.js',
    );
  }

  private async resolveVersionAndName(name: string, scopeOrName: string) {
    let scope = '';
    let version = '';
    if (!name) {
      name = scopeOrName;
    } else {
      scope = scopeOrName;
    }
    const atSplitted = name.split('@');
    if (atSplitted.length === 3) {
      version = atSplitted[2];
      name = atSplitted[1];
    } else if (atSplitted.length === 2 && atSplitted[0] !== '') {
      version = atSplitted[1];
      name = atSplitted[0];
    }

    const manifest = await this.getManifest(
      `${scope}${scope ? '/' : ''}${name}${version ? '@' : ''}${version}`,
    );
    version = manifest.version;

    return { scope, version, name, manifest };
  }

  private async getPackageJson(filePath) {
    try {
      const packageJson = await readJson(
        join(this.config.STORAGE, filePath, 'package.json'),
      );
      return packageJson;
    } catch (ex) {
      if (ex.statusCode === 404) {
        throw new HttpException('No package found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(ex.message, ex.statusCode);
    }
  }

  private async getManifest(packagePath) {
    try {
      const packageJson = await manifest(packagePath, {
        registry: this.config.REGISTRY,
        fullMetadata: !this.config.SERVE_ALL,
      });
      return packageJson;
    } catch (ex) {
      if (ex.statusCode === 404) {
        throw new HttpException('No package found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(ex.message, ex.statusCode);
    }
  }
}
