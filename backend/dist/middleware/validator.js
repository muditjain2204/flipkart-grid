"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/**
 * Factory that creates Express middleware for Zod schema validation.
 * Validates request body, params, and/or query against provided schemas.
 */
function validate(schema) {
    return (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            next();
        }
        catch (error) {
            next(error); // Caught by errorHandler which formats ZodErrors
        }
    };
}
//# sourceMappingURL=validator.js.map