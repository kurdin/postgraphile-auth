import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import { BAD_REQUEST } from "http-status-codes"

export const requireQueryParameters = (requiredParameters: string[]) => (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  for (const param of requiredParameters) {
    if (!req.query[param]) {
      next(createError(BAD_REQUEST, `Missing required parameter: ${param}.`))
    }
  }

  next()
}

export const requireBodyProperties = (requiredProperties: string[]) => (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  for (const prop of requiredProperties) {
    if (!req.body[prop]) {
      next(createError(BAD_REQUEST, `Missing required body property: ${prop}.`))
    }
  }

  next()
}
