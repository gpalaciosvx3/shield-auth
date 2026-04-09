import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessBody } from '../types/api-response.types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessBody<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessBody<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
