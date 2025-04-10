"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerOptions = void 0;
exports.swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Talabatk API",
            version: "1.0.0",
            description: "Talabatk Food Ordering Platform API",
        },
        servers: [
            {
                url: process.env.NODE_ENV === "production"
                    ? "https://talabatk-api-v2.vercel.app"
                    : "http://localhost:3000",
                description: process.env.NODE_ENV === "production"
                    ? "Production server"
                    : "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT", // Optional: just for documentation
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts"], // مسارات التوثيق
};
//# sourceMappingURL=swagger.js.map