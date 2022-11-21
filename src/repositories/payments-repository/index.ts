import { prisma } from "@/config";
import { UpdatePayment } from "@/protocols";

async function findTicketById(ticketId: number) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      Enrollment: true,
      TicketType: {
        select: {
          price: true,
        },
      },
    },
  });
}

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function updateTicketStatus(ticketId: number) {
  return prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: "PAID",
    },
  });
}

async function createPaidPayment(body: UpdatePayment, value: number) {
  return prisma.payment.create({
    data: {
      ticketId: body.ticketId,
      value: value,
      cardIssuer: body.cardData.issuer,
      cardLastDigits: body.cardData.number.slice(11),
    },
  });
}

const paymentsRepository = { findTicketById, findPaymentByTicketId, updateTicketStatus, createPaidPayment };

export default paymentsRepository;
