"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, statusCode = 200, meta) {
    const response = {
        success: true,
        data,
        ...(meta && { meta }),
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
}
function sendError(res, message, statusCode = 500) {
    const response = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
}
function sendPaginated(res, data, total, page, limit) {
    sendSuccess(res, data, 200, {
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}
//# sourceMappingURL=response.js.map