import { SetMetadata } from '@nestjs/common';

export const USE_SLAVE_DB = 'use_slave_db';
export const UseSlaveDB = () => SetMetadata(USE_SLAVE_DB, true);
