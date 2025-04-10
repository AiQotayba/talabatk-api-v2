import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: "Bad Request",
      errors: errors.array().reduce((acc: any, error: any) => {
        acc[error.param] = error.msg
        return acc
      }, {}),
    })
    return // Just return without a value
  }
  next()
}
  