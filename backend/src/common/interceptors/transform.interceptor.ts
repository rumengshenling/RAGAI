import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式拦截器
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => ({
                code: 200,
                message: '操作成功',
                data: data || null,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}

/**
 * 统一API响应格式
 */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
}
