import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getTickets, getTicketsTypes, postTicket } from "@/controllers";
import { newTicketSchema } from "@/schemas/tickets-schemas";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/", getTickets)
  .post("/", validateBody(newTicketSchema), postTicket)
  .get("/types", getTicketsTypes);

export { ticketsRouter };
