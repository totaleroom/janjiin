/**
 * =============================================================================
 * AUTHENTICATION MODULE - Janji.in Booking Platform
 * =============================================================================
 * 
 * This module handles all authentication-related functionality:
 * - Password hashing using bcrypt (10 salt rounds)
 * - JWT token generation and verification
 * - Express middleware for route protection
 * 
 * SECURITY NOTES:
 * - JWT_SECRET should be set in environment variables for production
 * - Tokens expire after 7 days by default
 * - Passwords are hashed with bcrypt before storage
 * 
 * MIDDLEWARE:
 * - isAuthenticated: Verifies JWT token in Authorization header
 * - isAdmin: Restricts access to admin users only
 * - isBusiness: Restricts access to business owners or admins
 * - validateBusinessOwnership: Ensures user owns the business they're accessing
 * 
 * USAGE:
 * ```typescript
 * app.get("/api/protected", isAuthenticated, (req, res) => {
 *   const user = req.user; // TokenPayload with userId, email, role
 * });
 * ```
 * 
 * @file server/auth.ts
 * @author Janji.in Team
 * =============================================================================
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

/** Number of bcrypt salt rounds - higher = more secure but slower */
const SALT_ROUNDS = 10;

/** JWT secret key - MUST be changed in production via environment variable */
const JWT_SECRET = process.env.JWT_SECRET || "janji-in-secret-key-change-in-production";

/** JWT token expiration time */
const JWT_EXPIRES_IN = "7d";

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored bcrypt hash
 * @returns true if password matches, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * JWT Token Payload structure
 * This is stored in the token and available on req.user after authentication
 */
export interface TokenPayload {
    userId: string;
    email: string;
    role: "admin" | "business" | "customer";
    businessId?: string;
}

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * Middleware: Verify user is authenticated via JWT
 * Checks for Bearer token in Authorization header
 * Attaches decoded user info to req.user
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token tidak valid atau expired" });
    }
}

/**
 * Middleware: Restrict access to admin users only
 * Must be used AFTER isAuthenticated middleware
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat mengakses." });
    }

    next();
}

/**
 * Middleware: Restrict access to business owners or admins
 * Must be used AFTER isAuthenticated middleware
 */
export function isBusiness(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "business" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Akses ditolak. Hanya pemilik bisnis yang dapat mengakses." });
    }

    next();
}

/**
 * Middleware: Validate that user owns the business they're trying to access
 * Checks businessId from URL params against user's businessId
 * Admins can access all businesses
 */
export function validateBusinessOwnership(req: Request, res: Response, next: NextFunction) {
    const { businessId } = req.params;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Admin can access all businesses
    if (req.user.role === "admin") {
        return next();
    }

    // Business owner can only access their own business
    if (req.user.businessId !== businessId) {
        return res.status(403).json({ message: "Anda tidak memiliki akses ke bisnis ini" });
    }

    next();
}
