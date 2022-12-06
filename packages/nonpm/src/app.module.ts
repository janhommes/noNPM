import * as dotenv from 'dotenv';
import { DynamicModule, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CONFIG, NoNpmConfig } from './config';

dotenv.config();

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', CONFIG.STORAGE),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'CONFIG',
      useValue: CONFIG,
    },
  ],
})
export class AppModule {
  static register(customConfig: NoNpmConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), customConfig.STORAGE),
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: 'CONFIG',
          useValue: customConfig,
        },
      ],
    };
  }
}
