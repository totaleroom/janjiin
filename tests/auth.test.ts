import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as auth from "../server/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("server/auth", () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnThis();
    res.json = vi.fn().mockReturnThis();
    return res as Response;
  };

  const mockNext = () => vi.fn() as unknown as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Password hashing
  it("hashPassword uses bcrypt.hash with configured salt rounds", async () => {
    (bcrypt.hash as unknown as vi.Mock).mockResolvedValue("hashed");
    const result = await auth.hashPassword("secret");
    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(result).toBe("hashed");
  });

  it("comparePassword uses bcrypt.compare and returns boolean", async () => {
    (bcrypt.compare as unknown as vi.Mock).mockResolvedValue(true);
    const result = await auth.comparePassword("secret", "hashed");
    expect(bcrypt.compare).toHaveBeenCalledWith("secret", "hashed");
    expect(result).toBe(true);
  });

  // JWT token
  it("generateToken signs payload with secret and expiry", () => {
    (jwt.sign as unknown as vi.Mock).mockReturnValue("token");
    const payload: auth.TokenPayload = {
      userId: "u1",
      email: "a@b.com",
      role: "customer",
    };
    const token = auth.generateToken(payload);
    expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), { expiresIn: "7d" });
    expect(token).toBe("token");
  });

  it("verifyToken verifies token and returns payload", () => {
    const payload: auth.TokenPayload = { userId: "1", email: "a@b.com", role: "admin" };
    (jwt.verify as unknown as vi.Mock).mockReturnValue(payload);
    const result = auth.verifyToken("tok");
    expect(jwt.verify).toHaveBeenCalledWith("tok", expect.any(String));
    expect(result).toEqual(payload);
  });

  // Middleware: isAuthenticated
  it("isAuthenticated returns 401 when Authorization header missing", () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token tidak ditemukan" });
    expect(next).not.toHaveBeenCalled();
  });

  it("isAuthenticated attaches user to req and calls next when token valid", () => {
    const req = { headers: { authorization: "Bearer good" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    const payload: auth.TokenPayload = { userId: "1", email: "a@b.com", role: "customer" };
    vi.spyOn(auth, "verifyToken").mockReturnValue(payload);

    auth.isAuthenticated(req, res, next);

    expect(auth.verifyToken).toHaveBeenCalledWith("good");
    expect((req as any).user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it("isAuthenticated returns 401 when token invalid", () => {
    const req = { headers: { authorization: "Bearer bad" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.spyOn(auth, "verifyToken").mockImplementation(() => {
      throw new Error("invalid");
    });

    auth.isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token tidak valid atau expired" });
    expect(next).not.toHaveBeenCalled();
  });

  // Role checks
  it("isAdmin returns 401 if req.user missing", () => {
    const req = { } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("isAdmin returns 403 if role not admin", () => {
    const req = { user: { role: "customer" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Akses ditolak. Hanya admin yang dapat mengakses." });
    expect(next).not.toHaveBeenCalled();
  });

  it("isAdmin calls next if role is admin", () => {
    const req = { user: { role: "admin" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("isBusiness returns 401 if req.user missing", () => {
    const req = { } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isBusiness(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("isBusiness returns 403 if role is not business or admin", () => {
    const req = { user: { role: "customer" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isBusiness(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Akses ditolak. Hanya pemilik bisnis yang dapat mengakses." });
    expect(next).not.toHaveBeenCalled();
  });

  it("isBusiness calls next for business role", () => {
    const req = { user: { role: "business" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isBusiness(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("isBusiness calls next for admin role", () => {
    const req = { user: { role: "admin" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.isBusiness(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // validateBusinessOwnership
  it("validateBusinessOwnership returns 401 if req.user missing", () => {
    const req = { params: { businessId: "b1" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.validateBusinessOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("validateBusinessOwnership allows admin to access any business", () => {
    const req = { params: { businessId: "b1" }, user: { role: "admin" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.validateBusinessOwnership(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("validateBusinessOwnership denies access when businessId mismatches", () => {
    const req = { params: { businessId: "b1" }, user: { role: "business", businessId: "b2" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.validateBusinessOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Anda tidak memiliki akses ke bisnis ini" });
    expect(next).not.toHaveBeenCalled();
  });

  it("validateBusinessOwnership allows access when businessId matches", () => {
    const req = { params: { businessId: "b1" }, user: { role: "business", businessId: "b1" } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    auth.validateBusinessOwnership(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
