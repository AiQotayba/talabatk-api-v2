import jwt, { SignOptions } from "jsonwebtoken"
import { config } from "../config/config"

export const generateToken = (userId: string): string => {
  const options: any = {
    expiresIn: config.jwtExpiresIn
  }
  return jwt.sign({ id: userId }, config.jwtSecret, options)
}

export const generateRefreshToken = (userId: string): string => {
  const options: any = {
    expiresIn: config.jwtRefreshExpiresIn
  }
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, options)
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret as jwt.Secret)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret as jwt.Secret)
  } catch (error) {
    throw new Error("Invalid refresh token")
  }
}
