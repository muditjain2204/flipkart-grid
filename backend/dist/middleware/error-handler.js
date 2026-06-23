"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: formattedErrors,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // Known operational errors
    if (err instanceof AppError) {
        logger_1.logger.warn(`AppError: ${err.message}`, { statusCode: err.statusCode });
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // Unknown errors
    logger_1.logger.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
    });
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=error-handler.js.map