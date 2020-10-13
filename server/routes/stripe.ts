import { NextFunction, Request, Response, Router } from "express";
import { ACCEPTED, NOT_FOUND } from "http-status-codes";
import {
  getPlans,
  getSubscription,
  handleWebHook,
  stripe,
  subscribe,
} from "../services/stripe";
import { requireBodyProperties } from "../utils/validation";

export const createStripeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await stripe.customers.create(req.body.user);
    res.json(customer);
  } catch (e) {
    next(e);
  }
};

export const updateStripeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await stripe.customers.update(
      req.params.id,
      req.body.user
    );
    res.json(customer);
  } catch (e) {
    next(e);
  }
};

export const getStripePlans = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plans = await getPlans();
    res.json(plans);
  } catch (e) {
    next(e);
  }
};

export const handleStripeWebhooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await handleWebHook(req);
    res.send(result);
  } catch (e) {
    if (e.code === NOT_FOUND) {
      return res.status(ACCEPTED).send(e.message);
    }

    next(e);
  }
};

export const createStripeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId, customerId, subscriptionId } = req.body;
    const subscription = await subscribe(planId, customerId, subscriptionId);
    res.json(subscription);
  } catch (e) {
    next(e);
  }
};

export const getStripeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const subscription = await getSubscription(id);
    res.json(subscription);
  } catch (e) {
    next(e);
  }
};

export const createStripeCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, currency, description, source } = req.body;
    const { status } = await stripe.charges.create({
      amount,
      currency,
      description,
      source,
    });
    res.json({ status });
  } catch (e) {
    next(e);
  }
};

const router = Router();

router.post("/stripe/user", requireBodyProperties(["user"]), createStripeUser);

router.patch(
  "/stripe/user/:id",
  requireBodyProperties(["user"]),
  updateStripeUser
);

router.get("/stripe/plans", getStripePlans);

router.post("/stripe/webhooks", handleStripeWebhooks);

router.post(
  "/stripe/subscribe",
  requireBodyProperties(["customerId", "planId", "subscriptionId"]),
  createStripeSubscription
);

router.get("/stripe/subscription/:id", getStripeSubscription);

router.post(
  "/stripe/charge",
  requireBodyProperties(["amount", "currency", "description", "source"]),
  createStripeCharge
);

export default router;
