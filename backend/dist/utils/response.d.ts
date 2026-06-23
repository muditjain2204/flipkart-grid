import { Response } from 'express';
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number, meta?: Record<string, unknown>): void;
export declare function sendError(res: Response, message: string, statusCode?: number): void;
export declare function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number): void;
//# sourceMappingURL=response.d.ts.map