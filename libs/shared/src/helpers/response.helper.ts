import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseHelper {
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    path?: string
  ): ApiResponse<T> {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static error(
    message: string = 'Operation failed',
    data?: any,
    path?: string
  ): ApiResponse {
    return {
      status: 'error',
      message,
      data,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
    path?: string
  ): ApiResponse<T> {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static updated<T>(
    data: T,
    message: string = 'Resource updated successfully',
    path?: string
  ): ApiResponse<T> {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static deleted(
    message: string = 'Resource deleted successfully',
    path?: string
  ): ApiResponse<null> {
    return {
      status: 'success',
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static updateError(
    message: string = 'Failed to update resource',
    path?: string
  ): ApiResponse<null> {
    return {
      status: 'error',
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  static deleteError(
    message: string = 'Failed to delete resource',
    path?: string
  ): ApiResponse<null> {
    return {
      status: 'error',
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }
}