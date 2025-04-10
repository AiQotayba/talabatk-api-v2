"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const restaurant_routes_1 = __importDefault(require("./routes/restaurant.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const banner_routes_1 = __importDefault(require("./routes/banner.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_1 = require("./config/swagger");
const config_1 = require("./config/config");
const banner_jobs_1 = require("./jobs/banner.jobs");
const PORT = config_1.config.port || 3000;
// Initialize express app
const app = (0, express_1.default)();
// Connect to MongoDB
(0, database_1.connectDB)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/restaurants", restaurant_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/addresses", address_routes_1.default);
app.use("/api/banners", banner_routes_1.default);
app.use("/api/search", search_routes_1.default);
// تعديل إعداد Swagger UI
const swaggerUiOptions = {
    swaggerOptions: {
        persistAuthorization: true,
    },
    customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css",
    customJs: [
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js",
    ],
};
// Swagger Documentation
const specs = (0, swagger_jsdoc_1.default)(swagger_1.swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, swaggerUiOptions));
// أو إذا كنت تريد تحديد مسار معين
app.use("/api-docs", express_1.default.static("/api-docs"));
// page home
app.use("/", (req, res) => {
    res.send(`
    <h1>this is home</h1> 
    <a href='/api-docs'>api-docs</a>
    <p>Good Luck</p>
    <p>Good Bye</p> 
    `);
});
// Error handling middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
// Start the server
app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT} `);
    console.log(`🔗 http://localhost:${PORT}/api-docs`);
    // Schedule banner jobs
    (0, banner_jobs_1.scheduleBannerJobs)();
    console.info("Banner jobs scheduled");
});
//# sourceMappingURL=app.js.map