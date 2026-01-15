import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface PerformanceMetrics {
  method: string;
  url: string;
  duration: number;
  timestamp: Date;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private metrics: PerformanceMetrics[] = [];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000; // Convert to ms
        const metric: PerformanceMetrics = {
          method,
          url,
          duration,
          timestamp: new Date(),
        };

        this.metrics.push(metric);

        // Log slow requests (>100ms)
        if (duration > 100) {
          this.logger.warn(
            `🐌 Slow Request: ${method} ${url} - ${duration.toFixed(2)}ms`,
          );
        }

        // Log statistics every 100 requests
        if (this.metrics.length % 100 === 0) {
          this.logStatistics();
        }

        // Keep only last 1000 metrics to prevent memory issues
        if (this.metrics.length > 500) {
          this.metrics = this.metrics.slice(-500);
        }
      }),
    );
  }

  private logStatistics() {
    if (this.metrics.length === 0) return;

    const durations = this.metrics.map((m) => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const p95 = this.percentile(durations, 95);
    const p99 = this.percentile(durations, 99);

    this.logger.log(`
📊 Performance Statistics (last ${this.metrics.length} requests):
   Average: ${avg.toFixed(2)}ms
   Min: ${min.toFixed(2)}ms
   Max: ${max.toFixed(2)}ms
   P95: ${p95.toFixed(2)}ms
   P99: ${p99.toFixed(2)}ms
    `);
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}

