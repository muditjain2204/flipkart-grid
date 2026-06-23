"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
const error_handler_1 = require("./middleware/error-handler");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// ─── Middleware ───────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsDir));
// Request logging
app.use((req, _res, next) => {
    logger_1.logger.debug(`${req.method} ${req.path}`, {
        query: req.query,
        ip: req.ip,
    });
    next();
});
// ─── Routes ──────────────────────────────────────────────
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        service: 'smartflow-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API routes
app.use('/api/v1', routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString(),
    });
});
// Global error handler (must be last)
app.use(error_handler_1.errorHandler);
// ─── Server Startup ──────────────────────────────────────
const PORT = env_1.env.PORT;
async function start() {
    try {
        // Test database connection
        await database_1.prisma.$connect();
        logger_1.logger.info('✅ Database connected');
        app.listen(PORT, () => {
            logger_1.logger.info(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🚦 SmartFlow AI Backend                    ║
  ║                                              ║
  ║   Server:    http://localhost:${PORT}            ║
  ║   API:       http://localhost:${PORT}/api/v1     ║
  ║   Health:    http://localhost:${PORT}/health      ║
  ║   Env:       ${env_1.env.NODE_ENV}                       ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    logger_1.logger.info('Shutting down gracefully...');
    await database_1.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received. Shutting down...');
    await database_1.prisma.$disconnect();
    process.exit(0);
});
start();
exports.default = app;
//# sourceMappingURL=index.js.map