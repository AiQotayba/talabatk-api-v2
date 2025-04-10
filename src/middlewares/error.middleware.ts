import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Server Error" : err.name,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
