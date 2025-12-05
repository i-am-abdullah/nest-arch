import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  master: {
    host: process.env.DB_MASTER_HOST || 'localhost',
    port: parseInt(process.env.DB_MASTER_PORT || '5432', 10),
    user: process.env.DB_MASTER_USER || 'postgres',
    password: process.env.DB_MASTER_PASSWORD || 'postgres',
    dbName: process.env.DB_MASTER_NAME || 'myapp',
  },
  slave: {
    host: process.env.DB_SLAVE_HOST || 'localhost',
    port: parseInt(process.env.DB_SLAVE_PORT || '5433', 10),
    user: process.env.DB_SLAVE_USER || 'postgres',
    password: process.env.DB_SLAVE_PASSWORD || 'postgres',
    dbName: process.env.DB_SLAVE_NAME || 'myapp',
  },
}));