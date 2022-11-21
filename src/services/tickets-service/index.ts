import ticketsRepository from "@/repositories/tickets-repository";
import { notFoundError } from "@/errors";

export async function findAllTicketTypes() {
  const tickets = await ticketsRepository.findTicketType();
  return tickets;
}

export async function getAllTickets(userId: number) {
  const allTickets = await ticketsRepository.findAllTickets(userId);
  if (!allTickets.enrollmentId || !allTickets) { throw notFoundError(); }
  return allTickets;
}

export async function postNewTicket(userId: number, ticketTypeId: number) {
  const userEnrollment = await ticketsRepository.findUserEnrollment(userId);
  if (!userEnrollment) { throw notFoundError(); }

  const createdTicket = await ticketsRepository.createTicket(ticketTypeId, userEnrollment.id);
  return createdTicket;
}

const ticketsService = {
  findAllTicketTypes,
  getAllTickets,
  postNewTicket
};

export default ticketsService;
