import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { readJson, writeJson } from 'fs-extra';
import { join } from 'path';
import { NoNpmConfig } from './config';
import { compareVersions } from 'compare-versions';
import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import { omit } from 'lodash';

@Injectable()
export class AppService implements OnApplicationShutdown {
  private uri = process.env.NONPM_MONGODB_URL;

  dbFilePath = join(this.config.STORAGE, 'db.json');
  content;
  collection: Collection<any>;
  client: MongoClient;

  constructor(@Inject('CONFIG') private config: NoNpmConfig) {
    Logger.debug('CURRENT CONFIG: ', config);
  }

  async connect() {
    this.client = new MongoClient(this.uri, {
      serverApi: ServerApiVersion.v1,
    });
    await this.client.connect();
    this.collection = this.client.db('nonpm').collection('packages');
  }

  async storeToDB(packageJson) {
    if (this.config.SEARCH === 'simple') {
      await this.useFileSystemStorage(packageJson);
    } else {
      await this.connectToMongoDb();
      await this.useMongoDbStorage(packageJson);
    }
  }

  private async useMongoDbStorage(packageJson: any) {
    const entity = await this.collection.findOne({
      name: packageJson.name,
    });

    if (entity) {
      const newItem = this.updateEntity(entity, packageJson);
      Logger.debug('Updating entry in DB');
      await this.collection.replaceOne({ name: packageJson.name }, newItem);
      Logger.debug('Entry updated');
    } else {
      Logger.debug('Insert entry in DB');
      await this.collection.insertOne({
        ...packageJson,
        _version: { [packageJson.version]: packageJson },
      });
      Logger.debug('Entry insert');
    }
  }

  private async connectToMongoDb() {
    try {
      if (!this.collection) {
        await this.connect();
      }
    } catch (ex) {
      Logger.debug('Can not connect to mongodb database.');
      Logger.debug(ex);
    }
  }

  private async useFileSystemStorage(packageJson: any) {
    try {
      if (!this.content) {
        this.content = await readJson(this.dbFilePath);
      }
    } catch {
      Logger.debug('db.json file does not exist or is not JSON.');
    }
    if (!this.content) {
      this.content = [];
    }
    const index = this.content.findIndex(
      ({ name }) => name === packageJson.name,
    );
    if (index > -1) {
      const newItem = this.updateEntity(this.content[index], packageJson);
      this.content[index] = newItem;
    } else {
      this.content.push({
        ...packageJson,
        _version: { [packageJson.version]: packageJson },
      });
    }
    await writeJson(this.dbFilePath, this.content);
  }

  private updateEntity(item: any, packageJson: any) {
    const versions = item._version;
    if (compareVersions(packageJson.version, item.version)) {
      const newItem = {
        ...packageJson,
        _version: { ...versions, [item.version]: omit(item, '_version') },
      };
      return newItem;
    } else {
      item._version[packageJson.version] = packageJson;
    }
    return item;
  }

  async search(term) {
    if (this.config.SEARCH === 'simple') {
      const content = this.content || (await readJson(this.dbFilePath)) || [];
      const filtered = content.filter(({ name }) =>
        new RegExp(term, 'g').test(name),
      );
      return filtered;
    } else {
      await this.connectToMongoDb();
      const test = await this.collection.aggregate([
        {
          $search: {
            index: 'default',
            compound: {
              should: [
                {
                  text: {
                    query: term,
                    path: {
                      wildcard: '*',
                    },
                  },
                },
                {
                  autocomplete: {
                    query: term,
                    path: 'name',
                  },
                },
              ],
            },
          },
        },
      ]);
      return test.map((item) => omit(item, '_version')).toArray();
    }
  }

  async onApplicationShutdown() {
    await this.client.close();
  }
}
