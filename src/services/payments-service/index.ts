import { notFoundError, unauthorizedError } from "@/errors";
import { UpdatePayment } from "@/protocols";
import paymentsRepository from "@/repositories/payments-repository";

async function getPaymentByTicketId(userId: number, ticketId: number) {
  await findTicket(userId, ticketId);

  const payment = await paymentsRepository.findPaymentByTicketId(ticketId);

  return payment;
}

async function createPaymentProcess(body: UpdatePayment, userId: number) {
  const paymentData = await findTicket(userId, body.ticketId);

  await paymentsRepository.updateTicketStatus(body.ticketId);

  const payment = await paymentsRepository.createPaidPayment(body, paymentData);

  return payment;
}

async function findTicket(userId: number, ticketId: number) {
  const ticketData = await paymentsRepository.findTicketById(ticketId);
  if (!ticketData) {
    throw notFoundError();
  }
  if (ticketData.Enrollment.userId !== userId) {
    throw unauthorizedError();
  }

  return ticketData.TicketType.price;
}

const paymentsService = { getPaymentByTicketId, createPaymentProcess };

export default paymentsService;
