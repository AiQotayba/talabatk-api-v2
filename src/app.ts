import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import { connectDB } from "./config/database"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import categoryRoutes from "./routes/category.routes"
import productRoutes from "./routes/product.routes"
import restaurantRoutes from "./routes/restaurant.routes"
import cartRoutes from "./routes/cart.routes"
import orderRoutes from "./routes/order.routes"
import addressRoutes from "./routes/address.routes"
import bannerRoutes from "./routes/banner.routes"
import searchRoutes from "./routes/search.routes"
import { errorHandler } from "./middlewares/error.middleware"
import swaggerUi from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import { swaggerOptions } from "./config/swagger"

import { config } from "./config/config"
import { scheduleBannerJobs } from "./jobs/banner.jobs"
import path from "path"

const PORT = config.port || 3000

// Initialize express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/banners", bannerRoutes)
app.use("/api/search", searchRoutes)

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
}

// Swagger Documentation
const specs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions))

// أو إذا كنت تريد تحديد مسار معين
app.use("/api-docs", express.static("/api-docs"))

// page home
app.use("/", (req, res) => {
  res.send(`
    <h1>this is home</h1> 
    <a href='/api-docs'>api-docs</a>
    <p>Good Luck</p>
    <p>Good Bye</p> 
    `)
})

// Error handling middleware
app.use(errorHandler)

export default app

// Start the server
app.listen(PORT, async () => {


  console.log(`Server started on port ${PORT} `)
  console.log(`🔗 http://localhost:${PORT}/api-docs`)

  // Schedule banner jobs
  scheduleBannerJobs()
  console.info("Banner jobs scheduled")
})
