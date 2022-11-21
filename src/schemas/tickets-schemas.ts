import Joi from "joi";

export const newTicketSchema = Joi.object({
  ticketTypeId: Joi.number().required(),
});
