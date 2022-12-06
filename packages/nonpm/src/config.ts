export interface NoNpmConfig {
  STORAGE: string;
  SERVE_ALL: boolean;
  SEARCH: 'simple' | 'mongodb';
  DEFAULT_APP: string;
  REGISTRY: string;
  PORT: number;
  CORS: boolean;
}

export const CONFIG: NoNpmConfig = {
  STORAGE: './.noNPM',
  SERVE_ALL: true,
  SEARCH: 'simple',
  DEFAULT_APP: '@no-npm/web',
  REGISTRY: 'https://registry.npmjs.org/',
  PORT: 3000,
  CORS: true,
};
