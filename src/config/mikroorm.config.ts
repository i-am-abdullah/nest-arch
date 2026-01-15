import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

// Shared configuration values
const getMasterConfig = () => ({
  host: process.env.DB_MASTER_HOST || 'localhost',
  port: parseInt(process.env.DB_MASTER_PORT || '5432', 10),
  user: process.env.DB_MASTER_USER || 'postgres',
  password: process.env.DB_MASTER_PASSWORD || 'postgres',
  dbName: process.env.DB_MASTER_NAME || 'nestarch',
});

const getSlaveConfig = () => ({
  host: process.env.DB_SLAVE_HOST || 'localhost',
  port: parseInt(process.env.DB_SLAVE_PORT || '5433', 10),
  user: process.env.DB_SLAVE_USER || 'postgres',
  password: process.env.DB_SLAVE_PASSWORD || 'postgres',
  dbName: process.env.DB_SLAVE_NAME || 'nestarch',
});

const commonConfig = {
  driver: PostgreSqlDriver,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
    emit: 'ts' as const,
  },
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true,
};

// NestJS config function (used by your app)
export const getMikroOrmConfig = (
  configService: ConfigService,
): MikroOrmModuleOptions => {
  const masterConfig = configService.get('database.master');
  const slaveConfig = configService.get('database.slave');

  return {
    ...commonConfig,
    host: masterConfig.host,
    port: masterConfig.port,
    user: masterConfig.user,
    password: masterConfig.password,
    dbName: masterConfig.dbName,
    replicas: [
      {
        host: slaveConfig.host,
        port: slaveConfig.port,
        user: slaveConfig.user,
        password: slaveConfig.password,
        dbName: slaveConfig.dbName,
      },
    ],
  } as MikroOrmModuleOptions;
};

// CLI config (used by MikroORM CLI for migrations)
// Reuses the same configuration logic
export default defineConfig({
  ...commonConfig,
  ...getMasterConfig(),
  extensions: [Migrator],
});