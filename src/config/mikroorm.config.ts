import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

export const getMikroOrmConfig = (
  configService: ConfigService,
): MikroOrmModuleOptions => {
  const masterConfig = configService.get('database.master');
  const slaveConfig = configService.get('database.slave');

  return {
    driver: PostgreSqlDriver,
    host: masterConfig.host,
    port: masterConfig.port,
    user: masterConfig.user,
    password: masterConfig.password,
    dbName: masterConfig.dbName,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    replicas: [
      {
        host: slaveConfig.host,
        port: slaveConfig.port,
        user: slaveConfig.user,
        password: slaveConfig.password,
        dbName: slaveConfig.dbName,
      },
    ],
    // Connection pool settings for better concurrency
    pool: {
      min: 2,           // Minimum connections in pool
      max: 20,          // Maximum connections in pool (adjust based on your needs)
      acquireTimeoutMillis: 30000,  // Time to wait for connection (30s)
      idleTimeoutMillis: 30000,      // Close idle connections after 30s
    },
    debug: process.env.NODE_ENV !== 'production',
    allowGlobalContext: true,
  } as MikroOrmModuleOptions;
};