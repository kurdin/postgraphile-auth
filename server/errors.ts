import { NextFunction, Request, Response } from "express";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

export const globalErrorHandler = (
  e: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(e);
  }

  return res
    .status(e.statusCode || INTERNAL_SERVER_ERROR)
    .json({ message: e.message });
};
