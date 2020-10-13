import { NextFunction, Request, Response, Router } from "express";
import createHttpError from "http-errors";
import { BAD_REQUEST, UNAUTHORIZED } from "http-status-codes";
import { cookieDefaults } from "../defaults";

const emailRouter = Router();

emailRouter.get(
  "/confirm",
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token) {
      return next(createHttpError(BAD_REQUEST, "Invalid link."));
    }

    const pgPool = req.app.get("pgPool");
    try {
      const {
        rows: [{ confirm_email }],
      } = await pgPool.query(
        "SELECT * FROM postgraphile_auth.confirm_email($1)",
        [token]
      );

      if (!confirm_email) {
        // TODO: show a front-end?
        return next(createHttpError(BAD_REQUEST, "Invalid link."));
      }

      res.redirect("/");
    } catch (e) {
      console.error(e);
      return next(
        createHttpError(
          UNAUTHORIZED,
          "Unable to confirm email using this link."
        )
      );
    }
  }
);

emailRouter.get(
  "/resetpassword",
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token) {
      return next(createHttpError(BAD_REQUEST, "Invalid link."));
    }

    const pgPool = req.app.get("pgPool");
    try {
      const {
        rows: [{ refresh_token }],
      } = await pgPool.query(
        `
          SELECT *
            FROM postgraphile_auth.exchange_reset_token_for_refresh_token($1)
            AS refresh_token
        `,
        [token]
      );

      if (!refresh_token) {
        // TODO: show a front-end?
        return next(createHttpError(BAD_REQUEST, "Invalid link."));
      }

      res.cookie("refresh_token", refresh_token, cookieDefaults);
      res.redirect(`/account/reset-password?token=${token}`);
    } catch (e) {
      return next(createHttpError(UNAUTHORIZED, "Unable to use this link."));
    }
  }
);

export default emailRouter;
