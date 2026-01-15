import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Observable } from 'rxjs';
import { USE_SLAVE_DB } from '../decorators/use-slave-db.decorator';
import { getMetadataFromContext } from '../utils/get-metadata-from-context.util';

@Injectable()
export class DbContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly orm: MikroORM,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const useSlave = getMetadataFromContext<boolean>(
      this.reflector,
      context,
      USE_SLAVE_DB,
    );

    if (useSlave) {
      const em = this.orm.em.fork();
      // Set the connection to use replica for read operations
      (em as any).useReplicas = true;
      return new Observable((subscriber) => {
        RequestContext.create(em, () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
  