import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // Nếu data đã là ApiResponse format, return as-is
        if (data && typeof data === 'object' && 'status' in data && 'message' in data) {
          return data;
        }

        // Clean data by removing null/undefined fields
        const cleanedData = this.removeNullFields(data);

        // Determine message based on HTTP method
        let message = 'Operation completed successfully';
        const method = request.method;
        const statusCode = response.statusCode;

        switch (method) {
          case 'GET':
            message = cleanedData && Array.isArray(cleanedData) 
              ? `Retrieved ${cleanedData.length} record(s) successfully`
              : 'Data retrieved successfully';
            break;
          case 'POST':
            message = 'Resource created successfully';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
        }

        // Handle special cases
        if (cleanedData && typeof cleanedData === 'object' && 'message' in cleanedData && Object.keys(cleanedData).length === 1) {
          // Case: { message: "..." } từ delete operations
          message = cleanedData.message;
          return {
            status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // For DELETE operations, don't include data
        if (method === 'DELETE') {
          return {
            status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        const responseObj: any = {
          status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        // Only add data field if it exists and is not null
        if (cleanedData !== null && cleanedData !== undefined) {
          responseObj.data = cleanedData;
        }

        return responseObj;
      }),
    );
  }

  private removeNullFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNullFields(item)).filter(item => item !== null && item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            const cleanedValue = this.removeNullFields(value);
            if (cleanedValue !== null && Object.keys(cleanedValue).length > 0) {
              cleaned[key] = cleanedValue;
            }
          } else if (Array.isArray(value)) {
            const cleanedArray = this.removeNullFields(value);
            if (cleanedArray.length > 0) {
              cleaned[key] = cleanedArray;
            }
          } else {
            cleaned[key] = value;
          }
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }

    return obj;
  }
}