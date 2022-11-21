import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getPayments, postProcessPayment } from "@/controllers";
import { paymentSchema } from "@/schemas/payments-schemas";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPayments)
  .post("/process", validateBody(paymentSchema), postProcessPayment);

export { paymentsRouter };
