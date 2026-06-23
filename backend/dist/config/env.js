"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    // Server
    PORT: zod_1.z.string().default('3000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // Database
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid connection string'),
    // CV Service
    CV_SERVICE_URL: zod_1.z.string().url().default('http://localhost:8001'),
    // LLM Provider
    LLM_PROVIDER: zod_1.z.enum(['gemini', 'openai']).default('gemini'),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    // Mapbox
    MAPBOX_ACCESS_TOKEN: zod_1.z.string().optional(),
    // Storage
    STORAGE_PROVIDER: zod_1.z.enum(['cloudinary', 's3']).default('cloudinary'),
    CLOUDINARY_URL: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map