import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"
import User from "../models/user.model"

export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      })
      return
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired token",
    })
  }
}

export const authorize = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      })
      return
    } 
    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      })
      return
    }
    
    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have permission to perform this action",
      })
      return
    }

    next()
  }
}
