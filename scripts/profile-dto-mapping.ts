/**
 * Simple profiling script to measure DTO mapping performance
 * 
 * Usage: npx ts-node scripts/profile-dto-mapping.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function profile() {
  console.log('🚀 Starting DTO mapping performance test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const iterations = 100;
  const timings: {
    dbQuery: number[];
    dtoMapping: number[];
    total: number[];
  } = {
    dbQuery: [],
    dtoMapping: [],
    total: [],
  };

  console.log(`Running ${iterations} iterations...`);

  for (let i = 0; i < iterations; i++) {
    const startTotal = process.hrtime.bigint();

    // Simulate timing (you'll need to add timing to your service)
    const result = await usersService.findPaginated(1, 20);

    const duration = Number(process.hrtime.bigint() - startTotal) / 1_000_000;
    timings.total.push(duration);

    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\rProgress: ${i + 1}/${iterations}`);
    }
  }

  console.log('\n\n📊 Results:');
  console.log('─'.repeat(50));

  const avgTotal = timings.total.reduce((a, b) => a + b, 0) / timings.total.length;
  const minTotal = Math.min(...timings.total);
  const maxTotal = Math.max(...timings.total);
  const p95Total = percentile(timings.total, 95);
  const p99Total = percentile(timings.total, 99);

  console.log(`Total Request Time (${iterations} iterations):`);
  console.log(`  Average: ${avgTotal.toFixed(2)}ms`);
  console.log(`  Min:     ${minTotal.toFixed(2)}ms`);
  console.log(`  Max:     ${maxTotal.toFixed(2)}ms`);
  console.log(`  P95:     ${p95Total.toFixed(2)}ms`);
  console.log(`  P99:     ${p99Total.toFixed(2)}ms`);

  console.log('\n💡 Note: To get detailed DTO mapping timing,');
  console.log('   add timing logs to UsersService.findPaginated()');
  console.log('   See PROFILING_GUIDE.md for details');

  await app.close();
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

profile().catch(console.error);

