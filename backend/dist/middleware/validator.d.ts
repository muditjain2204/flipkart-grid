import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Factory that creates Express middleware for Zod schema validation.
 * Validates request body, params, and/or query against provided schemas.
 */
export declare function validate(schema: {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validator.d.ts.map